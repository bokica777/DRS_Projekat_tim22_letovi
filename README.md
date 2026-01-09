# Avio letovi – Distribuirani sistemi

Platforma za simulaciju rada sa avio letovima.

## Arhitektura
- Client: React + Vite
- Server: Flask (Auth, korisnici, admin)
- Flight-service: Flask (letovi, kupovina, ocjene)
- DB1: korisnici
- DB2: letovi i kompanije
- Redis: cache + async obrada
- Docker Compose

## Pokretanje (dev)
```bash
docker compose up --build
