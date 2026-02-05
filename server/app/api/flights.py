import os
import requests
from flask import Blueprint, request, jsonify, abort, g
from app.socketio_app import socketio
from app.auth import auth_required, role_required  # koristi isto kao admin

bp = Blueprint("flights", __name__, url_prefix="/api")

FLIGHT_SERVICE_URL = os.getenv("FLIGHT_SERVICE_URL", "http://flight-service:5001")


@bp.post("/flights")
@auth_required
@role_required("MENADZER")
def create_flight_from_manager():
    payload = request.get_json(force=True)

    payload["created_by_user_id"] = request.user.get("sub")


    r = requests.post(f"{FLIGHT_SERVICE_URL}/internal/flights", json=payload, timeout=10)
    if r.status_code >= 400:
        return (r.text, r.status_code)

    dto = r.json()
    socketio.emit("flight.created.pending", dto, room="admins")
    return jsonify(dto), 201


@bp.post("/admin/flights/<int:flight_id>/approve")
@auth_required
@role_required("ADMIN")
def admin_approve(flight_id: int):
    r = requests.post(f"{FLIGHT_SERVICE_URL}/internal/flights/{flight_id}/approve", timeout=10)
    if r.status_code >= 400:
        return (r.text, r.status_code)
    dto = r.json()

    socketio.emit("flight.approved", dto, room="admins")
    socketio.emit("flight.approved", dto, room=f"user:{dto['created_by_user_id']}")
    return jsonify(dto)


@bp.post("/admin/flights/<int:flight_id>/reject")
@auth_required
@role_required("ADMIN")
def admin_reject(flight_id: int):
    data = request.get_json(force=True)
    reason = (data.get("reason") or "").strip()
    if not reason:
        abort(400, "Reason is required")

    r = requests.post(
        f"{FLIGHT_SERVICE_URL}/internal/flights/{flight_id}/reject",
        json={"reason": reason},
        timeout=10,
    )
    if r.status_code >= 400:
        return (r.text, r.status_code)

    dto = r.json()
    socketio.emit("flight.rejected", dto, room="admins")
    socketio.emit("flight.rejected", dto, room=f"user:{dto['created_by_user_id']}")
    return jsonify(dto)


@bp.post("/admin/flights/<int:flight_id>/cancel")
@auth_required
@role_required("ADMIN")
def admin_cancel(flight_id: int):
    r = requests.post(f"{FLIGHT_SERVICE_URL}/internal/flights/{flight_id}/cancel", timeout=10)
    if r.status_code >= 400:
        return (r.text, r.status_code)

    dto = r.json()
    socketio.emit("flight.cancelled", dto, room="admins")
    socketio.emit("flight.cancelled", dto, room=f"user:{dto['created_by_user_id']}")
    return jsonify(dto)
