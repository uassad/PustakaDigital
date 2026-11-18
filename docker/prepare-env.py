import json
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit, urlunsplit


ROOT = Path(__file__).resolve().parent.parent
SECRETS_DIR = ROOT / ".secrets"
SOURCE_ENV = SECRETS_DIR / ".env"
DOCKER_ENV = SECRETS_DIR / ".env.docker"
POSTGRES_ENV = SECRETS_DIR / ".postgres.env"


def decode_env_value(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        value = value[1:-1]
    return value


def main() -> None:
    if not SOURCE_ENV.is_file():
        raise SystemExit(f"Required source environment file not found: {SOURCE_ENV}")

    lines = SOURCE_ENV.read_text(encoding="utf-8-sig").splitlines(keepends=True)
    database_url = None
    output_lines = []

    for line in lines:
        match = re.match(r"^(\s*DATABASE_URL\s*=\s*)(.*?)(\r?\n)?$", line)
        if not match:
            output_lines.append(line)
            continue

        quote = match.group(2).strip()
        quote_char = quote[0] if len(quote) >= 2 and quote[0] == quote[-1] and quote[0] in "\"'" else ""
        value = quote[1:-1] if quote_char else quote
        parsed = urlsplit(value)
        if (
            parsed.scheme != "postgresql+asyncpg"
            or not parsed.hostname
            or not parsed.username
            or parsed.password is None
            or not parsed.path.strip("/")
        ):
            raise SystemExit("DATABASE_URL must be a PostgreSQL async URL with user, password, and database.")

        authority = parsed.netloc.rsplit("@", 1)[0] + "@postgres"
        if parsed.port is not None:
            authority += f":{parsed.port}"
        database_url = urlunsplit((parsed.scheme, authority, parsed.path, parsed.query, parsed.fragment))
        rendered_url = f"{quote_char}{database_url}{quote_char}" if quote_char else database_url
        newline = match.group(3) or ""
        output_lines.append(f"{match.group(1)}{rendered_url}{newline}")

    if database_url is None:
        raise SystemExit("DATABASE_URL was not found in the source environment file.")

    parsed = urlsplit(database_url)
    postgres_values = {
        "POSTGRES_USER": unquote(parsed.username),
        "POSTGRES_PASSWORD": unquote(parsed.password),
        "POSTGRES_DB": unquote(parsed.path.strip("/")),
    }

    SECRETS_DIR.mkdir(parents=True, exist_ok=True)
    DOCKER_ENV.write_text("".join(output_lines), encoding="utf-8")
    POSTGRES_ENV.write_text(
        "".join(f"{key}={json.dumps(value)}\n" for key, value in postgres_values.items()),
        encoding="utf-8",
    )
    print("Docker runtime environment files generated.")


if __name__ == "__main__":
    main()
