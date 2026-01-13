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

Flight-service upravlja letovima i DB2 bazom (PostgreSQL).
Server servis služi kao API gateway i koristi Flask-SocketIO za real-time obaveštavanje admina i korisnika o promenama statusa leta.
React klijent se povezuje preko WebSocket-a i dobija događaje u real-time.
