from flask import Blueprint, request, jsonify
from .db import db
from .models import User

admin_bp = Blueprint("admin_bp", __name__)

@admin_bp.get("/admin/users")
def list_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200


@admin_bp.delete("/admin/users/<int:user_id>")
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"status": "deleted"}), 200


@admin_bp.patch("/admin/users/<int:user_id>/role")
def change_role(user_id):
    data = request.get_json() or {}
    new_role = (data.get("role") or "").strip().upper()

    if new_role not in ["KORISNIK", "MENADZER", "ADMIN"]:
        return jsonify({"error": "Role must be KORISNIK, MENADZER or ADMIN"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.role = new_role
    db.session.commit()
    return jsonify(user.to_dict()), 200
