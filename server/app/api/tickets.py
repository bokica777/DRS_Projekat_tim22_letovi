import os
import requests
from flask import Blueprint, request, jsonify
from app.auth import auth_required
from app.db import db
from app.models import User

tickets_bp = Blueprint("tickets_bp", __name__)

def _flight_service_base() -> str:
    base = (os.getenv("FLIGHT_SERVICE_URL") or "").rstrip("/")
    if not base:
        raise RuntimeError("FLIGHT_SERVICE_URL nije postavljen (npr. http://flight-service:5001)")
    return base

def _get_user_id_from_jwt() -> int | None:
    u = getattr(request, "user", {}) or {}
    raw = u.get("user_id") or u.get("id") or u.get("sub")
    try:
        return int(raw)
    except Exception:
        return None


@tickets_bp.post("/api/tickets/buy")
@auth_required
def buy_ticket_public():
    data = request.get_json(silent=True) or {}
    flight_id = data.get("flight_id")

    if flight_id is None:
        return jsonify({"error": "flight_id is required"}), 400

    try:
        flight_id = int(flight_id)
    except Exception:
        return jsonify({"error": "flight_id must be an integer"}), 400

    user_id = _get_user_id_from_jwt()
    if not user_id:
        return jsonify({"error": "Invalid JWT user id"}), 401

    # 1) Uzmi let iz flight-service (da uzmemo cenu)
    base = _flight_service_base()
    fr = requests.get(f"{base}/internal/flights/{flight_id}", timeout=5)

    if fr.status_code == 404:
        return jsonify({"error": "Flight not found"}), 404
    if fr.status_code >= 400:
        return jsonify({"error": "Flight service error", "details": fr.text}), 502

    flight = fr.json() if fr.content else {}
    price = flight.get("price")

    if price is None:
        return jsonify({"error": "Flight response missing price"}), 502

    try:
        price = float(price)
    except Exception:
        return jsonify({"error": "Invalid flight price"}), 502

    # 2) Proveri balans u DB1
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found in DB1"}), 404

    if float(user.balance) < price:
        return jsonify({"error": "Insufficient balance", "balance": user.balance, "price": price}), 400

    # 3) Skini balans (commit)
    try:
        user.balance = float(user.balance) - price
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update balance", "details": str(e)}), 500

    # 4) Pozovi async buy u flight-service
    br = requests.post(
        f"{base}/internal/tickets/buy",
        json={"user_id": user_id, "flight_id": flight_id},
        timeout=5
    )

    if br.status_code == 202:
        return jsonify({
            "status": "accepted",
            "flight_id": flight_id,
            "user_id": user_id,
            "charged": price
        }), 202

    # 5) Ako buy nije uspeo -> refund (kompenzacija)
    try:
        user = User.query.get(user_id)
        if user:
            user.balance = float(user.balance) + price
            db.session.commit()
    except Exception:
        db.session.rollback()

    # Ako flight-service vrati 409 (validacije), prosledi korisniku kao 409
    if br.status_code == 409:
        return jsonify({"error": "Flight not eligible for purchase", "details": br.text}), 409

    return jsonify({
        "error": "Ticket buy failed in flight-service",
        "refund": True,
        "charged": price,
        "details": br.text
    }), 502


@tickets_bp.get("/api/tickets/my")
@auth_required
def my_tickets_public():
    user_id = _get_user_id_from_jwt()
    if not user_id:
        return jsonify({"error": "Invalid JWT user id"}), 401

    base = _flight_service_base()
    r = requests.get(f"{base}/internal/tickets/my", params={"user_id": user_id}, timeout=5)

    if r.status_code >= 400:
        return jsonify({"error": "Flight service error", "details": r.text}), 502

    data = r.json() if r.content else []
    return jsonify(data), 200
