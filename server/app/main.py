import os
from flask import Flask, jsonify
from dotenv import load_dotenv

from .db import db
from .routes_users import users_bp

from .routes_admin import admin_bp

load_dotenv()
from app.socketio_app import socketio, register_ws_handlers
from app.api.flights import bp as flights_bp  # tvoj fajl gde su /api/flights rute

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "dev"

    # rute
    app.register_blueprint(flights_bp)

    # DB1 konekcija (SQLite fajl iz .env)
db_url = os.getenv("DATABASE_URL", "sqlite:///db1_users.sqlite3")
app.config["SQLALCHEMY_DATABASE_URI"] = db_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Init DB
db.init_app(app)

# Registruj rute
app.register_blueprint(users_bp)
app.register_blueprint(admin_bp)

# Health ruta (da ostane kao ranije)
@app.get("/health")
    def health():
        return jsonify({"status": "server ok"})

# Napravi tabele (users) pri startu aplikacije
with app.app_context():
    db.create_all()

    # WS handlers
    socketio.init_app(app)
    register_ws_handlers()

    return app

app = create_app()

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)

