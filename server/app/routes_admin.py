from flask import Blueprint, request, jsonify
from .db import db
from .models import User
from .auth import auth_required, role_required   # ogranicenja
from .email.email_service import send_email
from .email.email_jobs import run_in_process

admin_bp = Blueprint("admin_bp", __name__)

@admin_bp.get("/admin/users")
@auth_required                     # ogranicenje
@role_required("ADMIN")            # ogranicenje
def list_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200


@admin_bp.delete("/admin/users/<int:user_id>")
@auth_required                     # ogranicenje
@role_required("ADMIN")            #ogranicenje
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"status": "deleted"}), 200


@admin_bp.patch("/admin/users/<int:user_id>/role")
@auth_required                     # ogranicenje
@role_required("ADMIN")            # ograniccenje
def change_role(user_id):
    data = request.get_json() or {}
    new_role = (data.get("role") or "").strip().upper()

    if new_role not in ["KORISNIK", "MENADZER", "ADMIN"]:
        return jsonify({"error": "Role must be KORISNIK, MENADZER or ADMIN"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    old_role = user.role
    user.role = new_role
    db.session.commit()

    # ✅ MAIL: samo kad prelazi u MENADZER (spec baš to traži)
    if old_role != "MENADZER" and new_role == "MENADZER":
        subject = "Promena uloge na platformi Avio Letovi"
        body = (
            f"Zdravo {user.first_name} {user.last_name},\n\n"
            f"Administrator ti je dodelio ulogu MENADŽER.\n"
            f"Sada možeš da kreiraš letove i kompanije.\n\n"
            f"Pozdrav,\nAvio Letovi"
        )
        run_in_process(send_email, user.email, subject, body)

    return jsonify(user.to_dict()), 200
