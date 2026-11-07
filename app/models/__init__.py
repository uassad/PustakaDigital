# Import model agar terdaftar di Base.metadata.
from app.models.buku import Buku
from app.models.favorit import Favorit
from app.models.kategori import KategoriBuku
from app.models.pengguna import Pengguna
from app.models.registration_challenge import RegistrationChallenge
from app.models.role import Role

__all__ = ["Pengguna", "Role", "KategoriBuku", "Buku", "Favorit", "RegistrationChallenge"]
