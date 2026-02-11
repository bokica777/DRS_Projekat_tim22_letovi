import os
from flask import Flask, request
from multiprocessing import Process

from app.api.routes import bp as internal_bp

from app.db.database import engine, SessionLocal, init_db


from app.scheduler.status_process import run_status_updater


def create_app() -> Flask:
    app = Flask(__name__)

    @app.get("/health")
    def health():
        return {"status": "flight-service ok"}

    init_db()

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

    app.register_blueprint(internal_bp)

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
        debug=False   
    )
