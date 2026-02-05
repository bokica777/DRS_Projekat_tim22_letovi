from flask_socketio import SocketIO, join_room
from flask import request, current_app
import jwt

socketio = SocketIO(cors_allowed_origins="*", async_mode="threading")

def _decode_token(token: str):
    return jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])

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
                user_id = payload.get("user_id") or payload.get("id") or payload.get("sub")
                role = payload.get("role")
            except Exception as e:
                print("[WS] invalid token:", e)
                return False  # odbij konekciju

        # 2) fallback (privremeno) dok ne prebaciš klijent
        if not user_id:
            user_id = request.args.get("user_id")
            role = request.args.get("role")

        if role == "ADMIN":
            join_room("admins")
        if user_id:
            join_room(f"user:{user_id}")

        print(f"[WS] connected user_id={user_id} role={role}")

    @socketio.on("ping")
    def on_ping(data):
        print("[WS] ping received:", data)
        return {"ok": True, "received": data}
