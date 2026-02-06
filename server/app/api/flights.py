import os
import requests
from flask import Blueprint, request, jsonify, abort
from app.socketio_app import socketio
from app.auth import auth_required, role_required
from app.email.email_service import send_email
from app.email.email_jobs import run_in_process
from app.models import User

bp = Blueprint("flights", __name__, url_prefix="/api")

FLIGHT_SERVICE_URL = os.getenv("FLIGHT_SERVICE_URL", "http://flight-service:5001")


def _fs_get(path: str, params=None):
    return requests.get(f"{FLIGHT_SERVICE_URL}{path}", params=params or {}, timeout=10)


def _fs_post(path: str, json=None):
    return requests.post(f"{FLIGHT_SERVICE_URL}{path}", json=json, timeout=10)


@bp.get("/companies")
@auth_required
def list_companies():
    # server proxy -> flight-service
    r = _fs_get("/internal/companies")
    if r.status_code >= 400:
        return (r.text, r.status_code)
    return jsonify(r.json()), 200


@bp.get("/flights")
@auth_required
def list_flights():
    # Query params (prosleđujemo 1:1)
    params = {
        "tab": request.args.get("tab"),
        "search": request.args.get("search"),
        "company_id": request.args.get("company_id"),
        "status": request.args.get("status"),
        "approval_status": request.args.get("approval_status"),
        "created_by_user_id": request.args.get("created_by_user_id"),
    }
    # ukloni None
    params = {k: v for k, v in params.items() if v not in [None, ""]}

    r = _fs_get("/internal/flights", params=params)
    if r.status_code >= 400:
        return (r.text, r.status_code)

    return jsonify(r.json()), 200


@bp.get("/flights/<int:flight_id>")
@auth_required
def get_flight(flight_id: int):
    r = _fs_get(f"/internal/flights/{flight_id}")
    if r.status_code >= 400:
        return (r.text, r.status_code)
    return jsonify(r.json()), 200


@bp.post("/flights")
@auth_required
@role_required("MENADZER")
def create_flight_from_manager():
    payload = request.get_json(force=True) or {}

    # ko je kreirao (iz JWT)
    payload["created_by_user_id"] = request.user.get("sub")

    r = _fs_post("/internal/flights", json=payload)
    if r.status_code >= 400:
        return (r.text, r.status_code)

    dto = r.json()
    socketio.emit("flight.created.pending", dto, room="admins")
    return jsonify(dto), 201


@bp.post("/admin/flights/<int:flight_id>/approve")
@auth_required
@role_required("ADMIN")
def admin_approve(flight_id: int):
    r = _fs_post(f"/internal/flights/{flight_id}/approve")
    if r.status_code >= 400:
        return (r.text, r.status_code)
    dto = r.json()

    socketio.emit("flight.approved", dto, room="admins")
    socketio.emit("flight.approved", dto, room=f"user:{dto.get('created_by_user_id')}")
    return jsonify(dto), 200


@bp.post("/admin/flights/<int:flight_id>/reject")
@auth_required
@role_required("ADMIN")
def admin_reject(flight_id: int):
    data = request.get_json(force=True) or {}
    reason = (data.get("reason") or "").strip()
    if not reason:
        abort(400, "Reason is required")

    r = _fs_post(
        f"/internal/flights/{flight_id}/reject",
        json={"reason": reason},
    )
    if r.status_code >= 400:
        return (r.text, r.status_code)

    dto = r.json()
    socketio.emit("flight.rejected", dto, room="admins")
    socketio.emit("flight.rejected", dto, room=f"user:{dto.get('created_by_user_id')}")
    return jsonify(dto), 200


@bp.post("/admin/flights/<int:flight_id>/cancel")
@auth_required
@role_required("ADMIN")
def admin_cancel(flight_id: int):
    r = _fs_post(f"/internal/flights/{flight_id}/cancel")
    if r.status_code >= 400:
        return (r.text, r.status_code)

    dto = r.json()
    socketio.emit("flight.cancelled", dto, room="admins")
    socketio.emit("flight.cancelled", dto, room=f"user:{dto.get('created_by_user_id')}")
      # ✅ 1) uzmi sve user_id koji imaju ticket za taj flight
    buyers_r = _fs_get("/internal/tickets/by-flight", params={"flight_id": flight_id})
    if buyers_r.status_code < 400:
        user_ids = buyers_r.json() if buyers_r.content else []
        # ✅ 2) mapiraj user_id -> email (DB1)
        if user_ids:
            users = User.query.filter(User.id.in_([int(x) for x in user_ids])).all()

            flight_name = dto.get("name") or f"Let #{flight_id}"
            dep = dto.get("departure_time") or ""
            frm = dto.get("from_airport") or ""
            to = dto.get("to_airport") or ""

            for u in users:
                subject = "Otkazan let – obaveštenje"
                body = (
                    f"Zdravo {u.first_name} {u.last_name},\n\n"
                    f"Obaveštavamo te da je otkazan let koji si kupio:\n"
                    f"- {flight_name}\n"
                    f"- {frm} -> {to}\n"
                    f"- Polazak: {dep}\n\n"
                    f"Pozdrav,\nAvio Letovi"
                )
                run_in_process(send_email, u.email, subject, body)

    return jsonify(dto), 200
