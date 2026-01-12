from flask_socketio import SocketIO, join_room
from flask import request

socketio = SocketIO(cors_allowed_origins="*", async_mode="eventlet")

def register_ws_handlers():
    @socketio.on("connect")
    def on_connect():
        user_id = request.args.get("user_id")
        role = request.args.get("role")

        if role == "ADMIN":
            join_room("admins")
        if user_id:
            join_room(f"user:{user_id}")

