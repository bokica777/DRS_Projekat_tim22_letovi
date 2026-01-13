import os
from flask import Flask, jsonify
from dotenv import load_dotenv

from app.auth import auth_bp
from app.db import db
from app.routes_users import users_bp
from app.routes_admin import admin_bp
from app.socketio_app import socketio, register_ws_handlers
from app.api.flights import bp as flights_bp

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "dev"

    # -----------------
    # DB1 konekcija
    # -----------------
    db_url = os.getenv("DATABASE_URL", "sqlite:///db1_users.sqlite3")
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    # -----------------
    # Blueprint-ovi
    # -----------------
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(flights_bp)  # flights.py već ima url_prefix="/api"



    # -----------------
    # Health ruta
    # -----------------
    @app.get("/health")
    def health():
        return jsonify({"status": "server ok"})

    # -----------------
    # Kreiranje tabela
    # -----------------
    with app.app_context():
        db.create_all()

    # -----------------
    # Socket.IO
    # -----------------
    socketio.init_app(app)
    register_ws_handlers()

    return app


app = create_app()

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
