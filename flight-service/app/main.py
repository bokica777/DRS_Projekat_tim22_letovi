import os
from flask import Flask, request
from multiprocessing import Process

# 1) Blueprint sa internim rutama
# Očekujem da imaš: flight-service/app/api/routes.py -> bp = Blueprint(...)
from app.api.routes import bp as internal_flights_bp

# 2) DB engine + SessionLocal + init schema
# Očekujem da imaš: flight-service/app/db/database.py (ili slično)
# Ako ti se fajl drugačije zove, javi pa prilagodim import.
from app.db.database import engine, SessionLocal, init_db

# 3) Scheduler proces
# Očekujem da imaš: flight-service/app/scheduler/status_process.py -> run_status_updater(engine)
from app.scheduler.status_process import run_status_updater


def create_app() -> Flask:
    app = Flask(__name__)

    # --- Health ---
    @app.get("/health")
    def health():
        return {"status": "flight-service ok"}

    # --- DB init (kreiranje tabela ako ne postoje) ---
    init_db()

    # --- DB session po requestu ---
    @app.before_request
    def open_db_session():
        # dostupno u rutama kao request.environ["db"]
        request.environ["db"] = SessionLocal()

    @app.teardown_request
    def close_db_session(exc):
        db = request.environ.get("db")
        if db:
            if exc:
                db.rollback()
            db.close()

    # --- Rute ---
    app.register_blueprint(internal_flights_bp)

    # --- Scheduler proces (planned -> in_progress -> finished) ---
    # Važno: pokreći scheduler samo u "main" procesu, ne pri reloaderu
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
        p = Process(target=run_status_updater, args=(engine,), daemon=True)
        p.start()

    return app


app = create_app()

if __name__ == "__main__":
    # NOTE: kod tebe je bio port 5001; zadržaću 5001 da ne razbije docker-compose.
    app.run(host="0.0.0.0", port=5001, debug=True)

