import requests
from flask import Blueprint, request, jsonify, abort
from app.socketio_app import socketio

bp = Blueprint("flights", __name__, url_prefix="/api")

FLIGHT_SERVICE_URL = os.getenv("FLIGHT_SERVICE_URL", "http://flight-service:5001")

def require_role(role: str):
    # placeholder - vi već imate JWT
    def guard():
        # npr. request.user.role
        if request.headers.get("X-ROLE") != role:
            abort(403)
    return guard

@bp.post("/flights")
def create_flight_from_manager():
    # MENADŽER kreira let :contentReference[oaicite:8]{index=8}
    require_role("MENADZER")()

    payload = request.get_json(force=True)

    # dopuni created_by_user_id iz JWT-a (nemoj verovati klijentu)
    payload["created_by_user_id"] = request.headers.get("X-USER-ID", "unknown")

    r = requests.post(f"{FLIGHT_SERVICE_URL}/internal/flights", json=payload, timeout=10)
    if r.status_code >= 400:
        return (r.text, r.status_code)

    dto = r.json()
    print("socketio is:", socketio)
    # real-time adminu: "novi let" :contentReference[oaicite:9]{index=9}
    socketio.emit("flight.created.pending", dto, room="admins")
    return jsonify(dto), 201

@bp.post("/admin/flights/<int:flight_id>/approve")
def admin_approve(flight_id: int):
    require_role("ADMIN")()
    r = requests.post(f"{FLIGHT_SERVICE_URL}/internal/flights/{flight_id}/approve", timeout=10)
    if r.status_code >= 400:
        return (r.text, r.status_code)
    dto = r.json()

    socketio.emit("flight.approved", dto, room="admins")
    socketio.emit("flight.approved", dto, room=f"user:{dto['created_by_user_id']}")
    return jsonify(dto)

@bp.post("/admin/flights/<int:flight_id>/reject")
def admin_reject(flight_id: int):
    require_role("ADMIN")()

    data = request.get_json(force=True)
    reason = (data.get("reason") or "").strip()
    if not reason:
        abort(400, "Reason is required")  # zadatak :contentReference[oaicite:10]{index=10}

    r = requests.post(f"{FLIGHT_SERVICE_URL}/internal/flights/{flight_id}/reject", json={"reason": reason}, timeout=10)
    if r.status_code >= 400:
        return (r.text, r.status_code)

    dto = r.json()
    socketio.emit("flight.rejected", dto, room="admins")
    socketio.emit("flight.rejected", dto, room=f"user:{dto['created_by_user_id']}")
    return jsonify(dto)

@bp.post("/admin/flights/<int:flight_id>/cancel")
def admin_cancel(flight_id: int):
    require_role("ADMIN")()

    r = requests.post(f"{FLIGHT_SERVICE_URL}/internal/flights/{flight_id}/cancel", timeout=10)
    if r.status_code >= 400:
        return (r.text, r.status_code)

    dto = r.json()
    socketio.emit("flight.cancelled", dto, room="admins")
    socketio.emit("flight.cancelled", dto, room=f"user:{dto['created_by_user_id']}")
    return jsonify(dto)
