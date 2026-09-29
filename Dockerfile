# ---------- Build React frontend ----------
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build


# ---------- Flask backend ----------
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/

# Copy React production build into Flask
COPY --from=frontend-builder /frontend/dist ./backend/frontend_dist/

WORKDIR /app/backend

ENV PORT=10000
ENV PYTHONUNBUFFERED=1

EXPOSE 10000

# Seed demo database, then start Flask through Gunicorn
CMD ["sh", "-c", "python seed.py && gunicorn --bind 0.0.0.0:10000 'app:create_app()'"]