import os
import time
from functools import wraps

import jwt
from flask import Blueprint, request, jsonify
from passlib.hash import pbkdf2_sha256

from .models import User

auth_bp = Blueprint("auth_bp", __name__)

# ================= CONFIG =================
JWT_SECRET = os.environ.get("JWT_SECRET", "dev_secret_change_me")
JWT_EXP_SECONDS = int(os.environ.get("JWT_EXP_SECONDS", "3600"))  # 1h
LOCK_SECONDS = int(os.environ.get("LOCK_SECONDS", "60"))          # 1 min za test


# ================= DB lookup =================
def get_user_by_email(email: str):
    email = (email or "").strip().lower()
    u = User.query.filter_by(email=email).first()
    if not u:
        return None

    # vraćamo dict da ostatak koda ostane isti
    return {
        "id": u.id,
        "email": u.email,
        "role": u.role,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "password_hash": u.password_hash,
    }


# ================= Login attempt tracking =================
ATTEMPTS = {}  # email -> {"fails": int, "locked_until": epoch_seconds}

def is_locked(email: str):
    rec = ATTEMPTS.get(email)
    if not rec:
        return False, 0
    now = int(time.time())
    locked_until = int(rec.get("locked_until", 0))
    return locked_until > now, max(0, locked_until - now)

def register_fail(email: str):
    rec = ATTEMPTS.setdefault(email, {"fails": 0, "locked_until": 0})
    rec["fails"] += 1
    if rec["fails"] >= 3:
        rec["locked_until"] = int(time.time()) + LOCK_SECONDS
    return rec

def reset_attempts(email: str):
    if email in ATTEMPTS:
        ATTEMPTS[email] = {"fails": 0, "locked_until": 0}


# ================= JWT helpers =================
def create_token(user):
    payload = {
        "sub": str(user["id"]),
        "email": user["email"],
        "role": user["role"],
        "exp": int(time.time()) + JWT_EXP_SECONDS,
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

    locked, seconds_left = is_locked(email)
    if locked:
        return jsonify({"error": "blocked", "retry_after_seconds": seconds_left}), 403

    user = get_user_by_email(email)
    if (not user) or (not pbkdf2_sha256.verify(password, user["password_hash"])):
        rec = register_fail(email)
        locked_now, seconds_left_now = is_locked(email)
        if locked_now:
            return jsonify({"error": "blocked", "retry_after_seconds": seconds_left_now}), 403
        return jsonify({"error": "invalid credentials", "fails": rec["fails"]}), 401

    reset_attempts(email)
    token = create_token(user)
    return jsonify({
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
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
