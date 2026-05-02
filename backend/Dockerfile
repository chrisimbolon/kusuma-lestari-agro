# ╔═══════════════════════════════════════════════════════════════╗
# ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
# ║         backend/Dockerfile                                    ║
# ╚═══════════════════════════════════════════════════════════════╝

# ── Build stage ───────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# System deps for Pillow (ImageField) + psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Runtime stage ─────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# Runtime system deps only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libjpeg62-turbo \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy project source
COPY . .

# Create non-root user for security
RUN addgroup --system kla && adduser --system --ingroup kla kla \
 && mkdir -p /app/media /app/staticfiles \
 && chown -R kla:kla /app

USER kla

EXPOSE 8000

# Gunicorn: 3 workers, timeout 120s for file uploads
CMD ["gunicorn", "kla_project.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
