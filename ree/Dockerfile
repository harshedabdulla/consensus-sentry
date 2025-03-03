FROM python:3.9-slim
WORKDIR /app
COPY . .

RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir spacy==3.8.3 && \
    python -m spacy download en_core_web_sm


COPY requirements.txt .
RUN grep -v "spacy" requirements.txt > requirements_filtered.txt && \
    pip install --no-cache-dir -r requirements_filtered.txt

CMD exec uvicorn gaurd:app --host 0.0.0.0 --port ${PORT:-8080}