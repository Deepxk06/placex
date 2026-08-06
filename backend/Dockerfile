FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Runtimes for the PlaceX code compiler module
RUN apt-get update && apt-get install -y --no-install-recommends \
        nodejs \
        gcc g++ make \
        default-jdk \
        golang-go \
        rustc cargo \
        ruby \
        php-cli \
        perl \
        lua5.3 \
        r-base \
        mono-devel \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-prod.txt .
RUN pip install --upgrade pip && pip install -r requirements-prod.txt

COPY app ./app
COPY ai ./ai

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
