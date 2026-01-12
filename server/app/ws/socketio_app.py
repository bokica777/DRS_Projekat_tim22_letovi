from flask_socketio import SocketIO, join_room
from flask import request

socketio = SocketIO(cors_allowed_origins="*")  # u dockeru fino podesi origin

def register_ws_handlers():
    @socketio.on("connect")
    def on_connect():
        # ovde normalno verifikuješ JWT iz query/header-a
        # i izvadiš role + user_id
        user_id = request.args.get("user_id")
        role = request.args.get("role")  # "ADMIN" / "MENADZER"

        if role == "ADMIN":
            join_room("admins")
        if user_id:
            join_room(f"user:{user_id}")  # menadžer room
