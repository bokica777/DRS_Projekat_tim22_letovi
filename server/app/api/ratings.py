import os
import requests
from flask import Blueprint, request, jsonify
from app.auth import auth_required, role_required

ratings_bp = Blueprint("ratings_bp", __name__, url_prefix="/api/ratings")

FLIGHT_SERVICE_URL = os.getenv(
    "FLIGHT_SERVICE_URL",
    "http://flight-service:5001"
)


def _get_user_id_from_jwt(req):
    u = getattr(req, "user", {}) or {}
    return u.get("sub")


def _proxy_json_response(r: requests.Response):
    """
    Pokušaj da vratiš JSON ako postoji, inače plain text.
    (da ne dobijaš HTML stranice kao u screenshot-u)
    """
    try:
        data = r.json() if r.content else None
        if data is None:
            return ("", r.status_code)
        return (jsonify(data), r.status_code)
    except Exception:
        return (r.text, r.status_code)


@ratings_bp.post("")
@auth_required
def create_rating():
    data = request.get_json(silent=True) or {}
    flight_id = data.get("flight_id")
    value = data.get("value")

    if flight_id is None or value is None:
        return jsonify({"error": "flight_id and value are required"}), 400

    user_id = _get_user_id_from_jwt(request)
    if not user_id:
        return jsonify({"error": "Invalid user"}), 401

    r = requests.post(
        f"{FLIGHT_SERVICE_URL}/internal/ratings",
        json={
            "user_id": user_id,
            "flight_id": flight_id,
            "value": value
        },
        timeout=5
    )

    return _proxy_json_response(r)


@ratings_bp.get("")
@auth_required
def list_ratings_for_flight():
    """
    GET /api/ratings?flight_id=3
    -> proxy na flight-service: /internal/ratings?flight_id=3
    """
    flight_id = (request.args.get("flight_id") or "").strip()
    if not flight_id:
        return jsonify({"error": "flight_id is required"}), 400

    r = requests.get(
        f"{FLIGHT_SERVICE_URL}/internal/ratings",
        params={"flight_id": flight_id},
        timeout=5
    )

    return _proxy_json_response(r)


@ratings_bp.get("/my")
@auth_required
def my_ratings():
    user_id = _get_user_id_from_jwt(request)
    if not user_id:
        return jsonify({"error": "Invalid user"}), 401

    r = requests.get(
        f"{FLIGHT_SERVICE_URL}/internal/ratings/my",
        params={"user_id": user_id},
        timeout=5
    )

    return _proxy_json_response(r)


@ratings_bp.get("/admin")
@auth_required
@role_required("ADMIN")
def admin_list_all_ratings():
    r = requests.get(
        f"{FLIGHT_SERVICE_URL}/internal/ratings",
        timeout=5
    )
    return _proxy_json_response(r)
