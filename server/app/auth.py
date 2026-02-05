import os
import time
from functools import wraps

import jwt
from flask import Blueprint, request, jsonify
from passlib.hash import pbkdf2_sha256

from .models import User
from .db import db

auth_bp = Blueprint("auth_bp", __name__)

# ================= CONFIG =================
JWT_SECRET = os.environ.get("JWT_SECRET", "dev_secret_change_me")
JWT_EXP_SECONDS = int(os.environ.get("JWT_EXP_SECONDS", "3600"))  # 1h
LOCK_SECONDS = int(os.environ.get("LOCK_SECONDS", "60"))          # 1 min za test


# ================= Helpers (DB lock) =================
def _now() -> int:
    return int(time.time())

def _parse_lock_until(lock_until_value) -> int:
    """
    lock_until je String u modelu, pa ga tretiramo kao epoch seconds u stringu.
    Ako je None/prazno/nevalidno -> 0.
    """
    if not lock_until_value:
        return 0
    try:
        return int(lock_until_value)
    except Exception:
        return 0

def is_locked_user(u: User):
    now = _now()
    locked_until = _parse_lock_until(u.lock_until)
    if locked_until > now:
        return True, max(0, locked_until - now)
    return False, 0

def register_fail_user(u: User):
    u.failed_login_count = int(u.failed_login_count or 0) + 1
    if u.failed_login_count >= 3:
        u.lock_until = str(_now() + LOCK_SECONDS)
    db.session.commit()
    return u.failed_login_count

def reset_attempts_user(u: User):
    u.failed_login_count = 0
    u.lock_until = None
    db.session.commit()


# ================= JWT helpers =================
def create_token(user):
    payload = {
        "sub": str(user.id),
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "exp": _now() + JWT_EXP_SECONDS,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Missing Bearer token"}), 401

        token = auth.split(" ", 1)[1].strip()
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        request.user = payload
        return fn(*args, **kwargs)
    return wrapper


def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = getattr(request, "user", None)
            if not user:
                return jsonify({"error": "Unauthorized"}), 401
            if user.get("role") not in roles:
                return jsonify({"error": "Forbidden"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


# ================= ROUTES =================

@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    # Uzimamo user-a iz DB
    u: User | None = User.query.filter_by(email=email).first()

    # Ako user ne postoji, vrati generic invalid (ne otkrivamo da li postoji)
    if not u:
        return jsonify({"error": "invalid credentials"}), 401

    # Provera lock-a iz DB
    locked, seconds_left = is_locked_user(u)
    if locked:
        return jsonify({"error": "blocked", "retry_after_seconds": seconds_left}), 403

    # Provera lozinke
    if not pbkdf2_sha256.verify(password, u.password_hash):
        fails = register_fail_user(u)
        locked_now, seconds_left_now = is_locked_user(u)
        if locked_now:
            return jsonify({"error": "blocked", "retry_after_seconds": seconds_left_now}), 403
        return jsonify({"error": "invalid credentials", "fails": fails}), 401

    # Uspešan login -> reset attempts u DB
    reset_attempts_user(u)

    token = create_token(u)
    return jsonify({
        "token": token,
        "user": {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "first_name": u.first_name,
            "last_name": u.last_name,
        }
    }), 200


@auth_bp.get("/me")
@auth_required
def me():
    u = request.user
    return jsonify({
        "id": u.get("sub"),
        "email": u.get("email"),
        "role": u.get("role"),
    }), 200


@auth_bp.post("/logout")
@auth_required
def logout():
    return jsonify({"message": "Logged out (client should delete token)"}), 200


@auth_bp.get("/admin/ping")
@auth_required
@role_required("ADMIN")
def admin_ping():
    return jsonify({"message": "pong (ADMIN OK)"}), 200
