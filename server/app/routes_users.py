import os
import uuid
from flask import Blueprint, request, jsonify
from passlib.hash import pbkdf2_sha256
from werkzeug.utils import secure_filename

from .db import db
from .models import User
from .auth import auth_required

users_bp = Blueprint("users_bp", __name__)

# folder gde čuvamo slike (server/app/static/uploads)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # .../server/app
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
ALLOWED_EXT = {"png", "jpg", "jpeg", "webp"}


def _allowed_filename(filename: str) -> bool:
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in ALLOWED_EXT


def _get_current_user():
    jwt_user = getattr(request, "user", {}) or {}
    raw_id = jwt_user.get("user_id") or jwt_user.get("id") or jwt_user.get("sub")
    try:
        user_id = int(raw_id)
    except Exception:
        return None
    return User.query.get(user_id)


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


@users_bp.post("/deposit")
@auth_required
def deposit():
    data = request.get_json(silent=True) or {}
    amount = data.get("amount")

    if amount is None:
        return jsonify({"error": "amount is required"}), 400

    try:
        amount = float(amount)
    except Exception:
        return jsonify({"error": "amount must be a number"}), 400

    if amount <= 0:
        return jsonify({"error": "amount must be > 0"}), 400

    user = _get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.balance = float(user.balance) + amount
    db.session.commit()

    return jsonify({
        "status": "ok",
        "balance": user.balance
    }), 200


# ✅ NOVO: prikaz sopstvenog profila
@users_bp.get("/me")
@auth_required
def me():
    user = _get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200


# ✅ NOVO: izmena profila (bez slike) - PATCH /api/users/me
@users_bp.patch("/me")
@auth_required
def update_profile():
    user = _get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True) or {}

    # dozvoljena polja za izmenu
    mapping = {
        "firstName": "first_name",
        "lastName": "last_name",
        "birthDate": "birth_date",
        "gender": "gender",
        "country": "country",
        "street": "street",
        "number": "number",
    }

    changed = False

    for in_key, model_attr in mapping.items():
        if in_key in data and str(data[in_key]).strip() != "":
            setattr(user, model_attr, str(data[in_key]).strip())
            changed = True

    # opciono: promena lozinke
    if "password" in data and str(data["password"]).strip() != "":
        user.password_hash = pbkdf2_sha256.hash(str(data["password"]))
        changed = True

    if not changed:
        return jsonify({"error": "No valid fields to update"}), 400

    db.session.commit()
    return jsonify(user.to_dict()), 200


# ✅ NOVO: upload slike profila (multipart/form-data, polje mora biti "file")
@users_bp.post("/me/image")
@auth_required
def upload_profile_image():
    user = _get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if "file" not in request.files:
        return jsonify({"error": "Missing file field (multipart name must be 'file')"}), 400

    f = request.files["file"]
    if not f or not f.filename or f.filename.strip() == "":
        return jsonify({"error": "Empty filename"}), 400

    if not _allowed_filename(f.filename):
        return jsonify({"error": "Invalid file type. Allowed: png, jpg, jpeg, webp"}), 400

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    original = secure_filename(f.filename)
    ext = original.rsplit(".", 1)[1].lower()
    unique = f"user_{user.id}_{uuid.uuid4().hex}.{ext}"

    path = os.path.join(UPLOAD_DIR, unique)
    f.save(path)

    user.profile_image = f"/static/uploads/{unique}"
    db.session.commit()

    return jsonify(user.to_dict()), 200

from flask import send_file

@users_bp.get("/me/image")
@auth_required
def get_profile_image():
    user = _get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if not user.profile_image:
        return jsonify({"error": "No profile image"}), 404

    # user.profile_image je tipa "/static/uploads/ime.png"
    # moramo ga prevesti u stvarnu putanju na disku: server/app/static/uploads/ime.png
    rel = user.profile_image.lstrip("/")  # "static/uploads/ime.png"
    abs_path = os.path.join(BASE_DIR, rel)

    if not os.path.exists(abs_path):
        return jsonify({"error": "Image not found"}), 404

    return send_file(abs_path)
