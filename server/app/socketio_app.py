from flask_socketio import SocketIO, join_room
from flask import request, current_app
import os
import jwt

socketio = SocketIO(cors_allowed_origins="*", async_mode="threading")


def _get_jwt_secret() -> str:
    """
    JWT_SECRET mora biti isti kao u auth.py.
    Preferiramo env var, ali ako koristiš app.config, pokupi i odatle.
    """
    return (
        os.environ.get("JWT_SECRET")
        or current_app.config.get("JWT_SECRET")
        or "dev_secret_change_me"
    )


def _decode_token(token: str):
    secret = _get_jwt_secret()
    return jwt.decode(token, secret, algorithms=["HS256"])


def register_ws_handlers():
    @socketio.on("connect")
    def on_connect(auth):
        user_id = None
        role = None

        # 1) prefer auth token
        token = None
        if isinstance(auth, dict):
            token = auth.get("token")

        if token:
            try:
                payload = _decode_token(token)

                # U auth.py koristimo "sub" (string). Dodatno podržimo i "user_id"/"id".
                user_id = payload.get("user_id") or payload.get("id") or payload.get("sub")
                role = payload.get("role")

                if user_id is None:
                    print("[WS] token decoded but missing user id (sub/user_id/id). payload=", payload)
                    return False

            except jwt.ExpiredSignatureError:
                print("[WS] invalid token: expired")
                return False
            except Exception as e:
                print("[WS] invalid token:", e)
                return False  # odbij konekciju

        # 2) fallback (privremeno) dok ne prebaciš klijent (NE preporučujem za produkciju)
        if not user_id:
            user_id = request.args.get("user_id")
            role = request.args.get("role")

        if role == "ADMIN":
            join_room("admins")
        if user_id:
            join_room(f"user:{user_id}")

        print(f"[WS] connected user_id={user_id} role={role}")
        return True

    @socketio.on("ping")
    def on_ping(data):
        print("[WS] ping received:", data)
        return {"ok": True, "received": data}
