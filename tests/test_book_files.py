"""Tes penghapusan berkas buku: hanya di books/cover & books/body, tanpa shell, anti traversal/injection.

Jalankan:  pytest -q tests/test_book_files.py
"""
import os
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


@pytest.fixture(scope="module")
def bf():
    os.environ.update(
        DATABASE_URL="postgresql+asyncpg://u:p@localhost/db",
        JWT_SECRET_KEY="k" * 48, PASSWORD_PEPPER="p" * 48,
    )
    from app.services import book_files

    return book_files


@pytest.fixture
def dirs(tmp_path):
    cover, body, outside = tmp_path / "cover", tmp_path / "body", tmp_path / "luar"
    for d in (cover, body, outside):
        d.mkdir()
    return cover, body, outside


ISBN = "9786020634944"


def test_deletes_stored_and_isbn_named_files(bf, dirs):
    cover, body, _ = dirs
    (cover / "abc_123.jpg").write_bytes(b"x")
    (body / "abc_123.pdf").write_bytes(b"x")
    (body / f"{ISBN}.pdf").write_bytes(b"x")
    deleted, failed = bf.remove_book_files(
        ISBN, "books/cover/abc_123.jpg", "books/body/abc_123.pdf", cover_dir=cover, body_dir=body
    )
    assert sorted(deleted) == [f"books/body/{ISBN}.pdf", "books/body/abc_123.pdf", "books/cover/abc_123.jpg"]
    assert failed == []
    assert list(cover.iterdir()) == [] and list(body.iterdir()) == []


def test_legacy_name_without_prefix_and_missing_files_are_ok(bf, dirs):
    cover, body, _ = dirs
    (body / "asta_cita.pdf").write_bytes(b"x")
    deleted, failed = bf.remove_book_files(ISBN, None, "asta_cita.pdf", cover_dir=cover, body_dir=body)
    assert deleted == ["books/body/asta_cita.pdf"] and failed == []
    assert bf.remove_book_files(ISBN, "books/cover/hilang.jpg", None, cover_dir=cover, body_dir=body) == ([], [])


@pytest.mark.parametrize("evil", [
    "../luar/rahasia.pdf", "books/body/../../luar/rahasia.pdf", "/etc/passwd", "C:\\Windows\\a.pdf",
    "..\\luar\\rahasia.pdf", "a.pdf; rm -rf /", "a.pdf && del *.*", "$(whoami).pdf", "`id`.pdf", "a|b.pdf",
    "*.pdf", "a?.pdf", "a b.pdf", "a.pdf:stream", "a.pdf\x00.jpg", "a.pdf\n", "books/cover/a.pdf",
    "nul.pdf", "a.exe", "a.pdf.", "", "books/body/", "sub/a.pdf",
])
def test_unsafe_stored_names_are_never_touched(bf, dirs, evil):
    cover, body, outside = dirs
    secret = outside / "rahasia.pdf"
    secret.write_bytes(b"x")
    keep = body / "a.pdf"
    keep.write_bytes(b"x")
    deleted, failed = bf.remove_book_files(ISBN, None, evil, cover_dir=cover, body_dir=body)
    assert deleted == []
    assert secret.exists() and keep.exists()
    assert failed == ["body: path tidak valid, tidak dihapus"] or evil == ""


def test_symlink_is_refused(bf, dirs):
    cover, body, outside = dirs
    real = outside / "rahasia.pdf"
    real.write_bytes(b"x")
    try:
        (body / "link.pdf").symlink_to(real)
    except (OSError, NotImplementedError):
        pytest.skip("symlink tidak didukung")
    deleted, failed = bf.remove_book_files(ISBN, "books/body/link.pdf", None, cover_dir=cover, body_dir=body)
    assert deleted == [] and real.exists()


def test_skip_keeps_file_used_by_other_book(bf, dirs):
    cover, body, _ = dirs
    (body / "dipakai.pdf").write_bytes(b"x")
    deleted, _ = bf.remove_book_files(
        ISBN, None, "books/body/dipakai.pdf", skip=frozenset({"books/body/dipakai.pdf"}), cover_dir=cover, body_dir=body
    )
    assert deleted == [] and (body / "dipakai.pdf").exists()


def test_cover_name_cannot_be_used_to_delete_body_folder_file(bf, dirs):
    cover, body, _ = dirs
    (body / "x.jpg").write_bytes(b"x")
    deleted, _ = bf.remove_book_files(ISBN, "books/body/x.jpg", None, cover_dir=cover, body_dir=body)
    assert deleted == [] and (body / "x.jpg").exists()


def test_module_has_no_shell_usage():
    import ast

    path = Path(__file__).resolve().parent.parent / "app" / "services" / "book_files.py"
    tree = ast.parse(path.read_text())
    imported = {a.name.split(".")[0] for n in ast.walk(tree) if isinstance(n, ast.Import) for a in n.names}
    imported |= {n.module.split(".")[0] for n in ast.walk(tree) if isinstance(n, ast.ImportFrom) and n.module}
    assert not imported & {"subprocess", "os", "shutil", "pty"}
    calls = {n.func.id for n in ast.walk(tree) if isinstance(n, ast.Call) and isinstance(n.func, ast.Name)}
    assert not calls & {"eval", "exec", "compile", "__import__"}
