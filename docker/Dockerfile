# KALI LINUX
FROM python:3.12-slim

# Prevent Python from writing bytecode and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install minimal system dependencies (curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root system user and group (Debian syntax)
RUN groupadd --system nonroot && useradd --system --gid nonroot nonroot

# Install Python dependencies
COPY .secrets/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code with proper ownership
COPY --chown=nonroot:nonroot ["1. dist_prod/", "./"]

# Ensure directories exist and are owned by nonroot
RUN mkdir -p books/cover books/body .secrets \
    && chown -R nonroot:nonroot /app

# Switch to non-root user before running the app
USER nonroot

# Expose backend service port
EXPOSE 8000

# Run Uvicorn behind a reverse proxy
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips=*"]