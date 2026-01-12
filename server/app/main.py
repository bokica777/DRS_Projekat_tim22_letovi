from flask import Flask
from app.socketio_app import socketio, register_ws_handlers
from app.api.flights import bp as flights_bp  # tvoj fajl gde su /api/flights rute

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "dev"

    # rute
    app.register_blueprint(flights_bp)

    @app.route("/health")
    def health():
        return {"status": "server ok"}

    # WS handlers
    socketio.init_app(app)
    register_ws_handlers()

    return app

app = create_app()

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)

