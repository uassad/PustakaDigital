# syntax=docker/dockerfile:1

# ==============================================================================
# Base stage: Python environment, dependencies & non-root user
# ==============================================================================
FROM python:3.12-slim AS base

# Prevent Python from writing bytecode and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install minimal system dependencies (curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root system user and group (Debian syntax)
RUN groupadd --system nonroot && useradd --system --gid nonroot nonroot

# Install Python dependencies (supports requirements.txt from root or .secrets/)
COPY requirements.txt* .secrets/requirements.txt* ./
RUN if [ -f requirements.txt ]; then \
        pip install --no-cache-dir -r requirements.txt; \
    else \
        pip install --no-cache-dir -r .secrets/requirements.txt; \
    fi

# Ensure storage and secret directories exist with nonroot ownership
RUN mkdir -p /app/books/cover /app/books/body /app/.secrets \
    && chown -R nonroot:nonroot /app

EXPOSE 8000

# ==============================================================================
# Development stage: Uses raw source code directly (supports hot-reload)
# ==============================================================================
FROM base AS development

# Copy application source code
COPY --chown=nonroot:nonroot app/ ./app/
COPY --chown=nonroot:nonroot configuration/ ./configuration/
COPY --chown=nonroot:nonroot statics/ ./statics/
COPY --chown=nonroot:nonroot templates/ ./templates/
COPY --chown=nonroot:nonroot main.py ./main.py

USER nonroot

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ==============================================================================
# Production stage: Uses protected/obfuscated dist build (1. dist_prod/)
# ==============================================================================
FROM base AS production

# Copy obfuscated and minified production build
COPY --chown=nonroot:nonroot ["1. dist_prod/", "./"]

USER nonroot

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips=*"]
