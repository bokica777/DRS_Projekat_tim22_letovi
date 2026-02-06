import os
from flask import Flask, request
from multiprocessing import Process

# Internal API
from app.api.routes import bp as internal_bp

# DB engine + session + init
from app.db.database import engine, SessionLocal, init_db

# Scheduler
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
    # DB init
    # -----------------
    init_db()

    # -----------------
    # DB session per request
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
    # Routes
    # -----------------
    app.register_blueprint(internal_bp)

    # -----------------
    # START SCHEDULER (ALWAYS)
    # -----------------
    p = Process(
        target=run_status_updater,
        args=(engine,),
        daemon=True
    )
    p.start()
    print(">>> Flight status scheduler STARTED <<<")

    return app


app = create_app()

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=False   # ⬅️ OVO JE BITNO
    )
