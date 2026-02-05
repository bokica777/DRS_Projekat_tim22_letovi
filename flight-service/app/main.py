import os
from flask import Flask, request
from multiprocessing import Process

# Internal API (flights + uskoro tickets)
from app.api.routes import bp as internal_bp

# DB engine + session + init
from app.db.database import engine, SessionLocal, init_db

# Scheduler za status leta (PLANNED -> IN_PROGRESS -> FINISHED)
from app.scheduler.status_process import run_status_updater


def create_app() -> Flask:
    app = Flask(__name__)

    # -----------------
    # Health check
    # -----------------
    @app.get("/health")
    def health():
        return {"status": "flight-service ok"}

    # -----------------
    # DB init (kreira sve tabele ako ne postoje)
    # -----------------
    init_db()

    # -----------------
    # DB session po requestu
    # -----------------
    @app.before_request
    def open_db_session():
        request.environ["db"] = SessionLocal()

    @app.teardown_request
    def close_db_session(exc):
        db = request.environ.get("db")
        if db:
            try:
                if exc:
                    db.rollback()
            finally:
                db.close()

    # -----------------
    # Rute (internal)
    # -----------------
    app.register_blueprint(internal_bp)

    # -----------------
    # Background scheduler (status leta)
    # -----------------
    # Pokreće se samo jednom (ne duplo zbog reloader-a)
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
        p = Process(
            target=run_status_updater,
            args=(engine,),
            daemon=True
        )
        p.start()

    return app


app = create_app()

if __name__ == "__main__":
    # port 5001 (kako ti je već u docker-compose)
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )
