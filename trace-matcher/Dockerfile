# /trace-matcher/Dockerfile
FROM python:3.11-alpine 
WORKDIR /app

# Install dependencies required by psycopg2 (for Postgres)
RUN apk add --no-cache postgresql-dev gcc musl-dev

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Default command to run the FastAPI app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]