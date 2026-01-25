from flask_socketio import SocketIO, join_room
from flask import request

socketio = SocketIO(cors_allowed_origins="*", async_mode="threading")

def register_ws_handlers():
    @socketio.on("connect")
    def on_connect():
        user_id = request.args.get("user_id")
        role = request.args.get("role")

        if role == "ADMIN":
            join_room("admins")
        if user_id:
            join_room(f"user:{user_id}")
 
        print(f"[WS] connected user_id={user_id} role={role}")

    # ✅ NOVO: minimalni test event (emit sa klijenta)
    @socketio.on("ping")
    def on_ping(data):
        print("[WS] ping received:", data)
        # 1) vrati ack (socket.io callback)
        return {"ok": True, "received": data}
        # (alternativa) ili emit nazad:
        # emit("pong", {"ok": True, "received": data})


