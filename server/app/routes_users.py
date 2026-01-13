from flask import Blueprint, request, jsonify
from passlib.hash import pbkdf2_sha256

from .db import db
from .models import User

users_bp = Blueprint("users_bp", __name__)

@users_bp.post("/register")
def register():
    data = request.get_json() or {}

    required_fields = [
        "firstName",
        "lastName",
        "email",
        "password",
        "birthDate",
        "gender",
        "country",
        "street",
        "number",
        "balance"
    ]

    # Provera obaveznih polja
    missing = [f for f in required_fields if f not in data or str(data[f]).strip() == ""]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    email = data["email"].strip().lower()

    # Provera da li email vec postoji
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    # Provera i parsiranje balance
    try:
        balance = float(data["balance"])
    except ValueError:
        return jsonify({"error": "Balance must be a number"}), 400

    # Password hashing (BEZ 72 bytes limita)
    password = str(data["password"])
    password_hash = pbkdf2_sha256.hash(password)

    # Kreiranje korisnika
    user = User(
        first_name=data["firstName"].strip(),
        last_name=data["lastName"].strip(),
        email=email,
        birth_date=str(data["birthDate"]).strip(),
        gender=str(data["gender"]).strip(),
        country=data["country"].strip(),
        street=data["street"].strip(),
        number=str(data["number"]).strip(),
        balance=balance,
        role="KORISNIK",
        password_hash=password_hash
    )

    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201
