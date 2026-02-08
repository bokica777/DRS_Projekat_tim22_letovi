import os
import requests
from flask import Blueprint, request, jsonify, abort

from app.socketio_app import socketio
from app.auth import auth_required, role_required
from app.email.email_service import send_email
from app.email.email_jobs import run_in_process
from app.models import User
from app.pdf.pdf_service import generate_flights_report_pdf

from app.cache.redis_cache import get_json, set_json, delete_prefix

bp = Blueprint("flights", __name__, url_prefix="/api")

FLIGHT_SERVICE_URL = os.getenv("FLIGHT_SERVICE_URL", "http://flight-service:5001")


# --------------------
# helpers ka flight-service
# --------------------
def _fs_get(path: str, params=None):
    return requests.get(f"{FLIGHT_SERVICE_URL}{path}", params=params or {}, timeout=10)


def _fs_post(path: str, json=None):
    return requests.post(f"{FLIGHT_SERVICE_URL}{path}", json=json, timeout=10)


def _fs_patch(path: str, json=None):
    return requests.patch(f"{FLIGHT_SERVICE_URL}{path}", json=json, timeout=10)


def _fs_delete(path: str):
    return requests.delete(f"{FLIGHT_SERVICE_URL}{path}", timeout=10)


# =========================
# COMPANIES
# =========================
@bp.get("/companies")
@auth_required
def list_companies():
    cache_key = "companies:v1"
    cached = get_json(cache_key)
    if cached is not None:
        return jsonify(cached), 200

    r = _fs_get("/internal/companies")
    if r.status_code >= 400:
        return r.text, r.status_code

    data = r.json()
    set_json(cache_key, data, ttl_seconds=60 * 30)  # 30 min
    return jsonify(data), 200


# =========================
# FLIGHTS (LIST / GET)
# =========================
@bp.get("/flights")
@auth_required
def list_flights():
    params = {
        "tab": request.args.get("tab"),
        "search": request.args.get("search"),
        "company_id": request.args.get("company_id"),
        "status": request.args.get("status"),
        "approval_status": request.args.get("approval_status"),
        "created_by_user_id": request.args.get("created_by_user_id"),
    }
    params = {k: v for k, v in params.items() if v not in [None, ""]}

    parts = [f"{k}={params.get(k, '')}" for k in sorted(params.keys())]
    cache_key = "flights:v1:" + "&".join(parts) if parts else "flights:v1:all"

    cached = get_json(cache_key)
    if cached is not None:
        return jsonify(cached), 200

    r = _fs_get("/internal/flights", params=params)
    if r.status_code >= 400:
        return r.text, r.status_code

    data = r.json()
    set_json(cache_key, data, ttl_seconds=20)  # kratko zbog scheduler-a
    return jsonify(data), 200


@bp.get("/flights/<int:flight_id>")
@auth_required
def get_flight(flight_id: int):
    r = _fs_get(f"/internal/flights/{flight_id}")
    if r.status_code >= 400:
        return r.text, r.status_code
    return jsonify(r.json()), 200


# =========================
# MANAGER – CREATE FLIGHT
# =========================
@bp.post("/flights")
@auth_required
@role_required("MENADZER")
def create_flight_from_manager():
    payload = request.get_json(force=True) or {}
    payload["created_by_user_id"] = request.user.get("sub")

    r = _fs_post("/internal/flights", json=payload)
    if r.status_code >= 400:
        return r.text, r.status_code

    dto = r.json()
    delete_prefix("flights:v1:")

    socketio.emit("flight.created.pending", dto, room="admins")
    return jsonify(dto), 201


# =========================
# MANAGER – EDIT REJECTED FLIGHT (REJECTED -> PENDING) ✅ DODATO
# =========================
@bp.patch("/flights/<int:flight_id>")
@auth_required
@role_required("MENADZER")
def manager_update_rejected_flight(flight_id: int):
    """
    Menadžer menja let koji je ADMIN odbio.
    flight-service interno proverava da je REJECTED i da je kreator isti.
    """
    payload = request.get_json(force=True) or {}

    # identitet menadžera iz JWT-a
    manager_id = (request.user or {}).get("sub")
    if not manager_id:
        return jsonify({"error": "Missing user id in JWT"}), 401

    # obavezno šaljemo user_id ka flight-service radi ownership check
    payload["user_id"] = str(manager_id)

    r = _fs_patch(f"/internal/flights/{flight_id}", json=payload)
    if r.status_code >= 400:
        return r.text, r.status_code

    dto = r.json()
    delete_prefix("flights:v1:")

    # real-time adminu: opet pending
    socketio.emit("flight.updated.pending", dto, room="admins")
    # i menadžeru da osveži ako ima listen
    socketio.emit("flight.updated.pending", dto, room=f"user:{dto.get('created_by_user_id')}")

    return jsonify(dto), 200


# =========================
# ADMIN – APPROVE / REJECT / CANCEL
# =========================
@bp.post("/admin/flights/<int:flight_id>/approve")
@auth_required
@role_required("ADMIN")
def admin_approve(flight_id: int):
    r = _fs_post(f"/internal/flights/{flight_id}/approve")
    if r.status_code >= 400:
        return r.text, r.status_code

    dto = r.json()
    delete_prefix("flights:v1:")

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

    r = _fs_post(f"/internal/flights/{flight_id}/reject", json={"reason": reason})
    if r.status_code >= 400:
        return r.text, r.status_code

    dto = r.json()
    delete_prefix("flights:v1:")

    socketio.emit("flight.rejected", dto, room="admins")
    socketio.emit("flight.rejected", dto, room=f"user:{dto.get('created_by_user_id')}")
    return jsonify(dto), 200


@bp.post("/admin/flights/<int:flight_id>/cancel")
@auth_required
@role_required("ADMIN")
def admin_cancel(flight_id: int):
    r = _fs_post(f"/internal/flights/{flight_id}/cancel")
    if r.status_code >= 400:
        return r.text, r.status_code

    dto = r.json()
    delete_prefix("flights:v1:")

    socketio.emit("flight.cancelled", dto, room="admins")
    socketio.emit("flight.cancelled", dto, room=f"user:{dto.get('created_by_user_id')}")

    buyers_r = _fs_get("/internal/tickets/by-flight", params={"flight_id": flight_id})
    if buyers_r.status_code < 400:
        user_ids = buyers_r.json() if buyers_r.content else []

        ids_int = []
        for x in user_ids:
            try:
                ids_int.append(int(x))
            except Exception:
                pass

        if ids_int:
            users = User.query.filter(User.id.in_(ids_int)).all()

            for u in users:
                subject = "Otkazan let – obaveštenje"
                body = (
                    f"Zdravo {u.first_name} {u.last_name},\n\n"
                    f"Otkazan je let koji si kupio:\n"
                    f"- {dto.get('name')}\n"
                    f"- {dto.get('from_airport')} -> {dto.get('to_airport')}\n"
                    f"- Polazak: {dto.get('departure_time')}\n\n"
                    "Pozdrav,\nAvio Letovi"
                )
                run_in_process(send_email, u.email, subject, body)

    return jsonify(dto), 200


# =========================
# ADMIN – DELETE FLIGHT
# =========================
@bp.delete("/admin/flights/<int:flight_id>")
@auth_required
@role_required("ADMIN")
def admin_delete_flight(flight_id: int):
    r = _fs_delete(f"/internal/flights/{flight_id}")
    if r.status_code >= 400:
        try:
            return jsonify(r.json()), r.status_code
        except Exception:
            return r.text, r.status_code

    delete_prefix("flights:v1:")
    socketio.emit("flight.deleted", {"id": flight_id}, room="admins")

    return jsonify({"status": "deleted", "id": flight_id}), 200


# =========================
# PDF REPORT (ADMIN)
# =========================
@bp.post("/admin/flights/report")
@auth_required
@role_required("ADMIN")
def admin_flights_report():
    tab = (request.args.get("tab") or "").strip().lower()
    if tab not in ["planned", "in_progress", "history"]:
        return jsonify({"error": "tab must be planned, in_progress or history"}), 400

    admin_email = (request.user or {}).get("email")
    if not admin_email:
        return jsonify({"error": "Admin email missing in JWT"}), 400

    fr = _fs_get("/internal/flights", params={"tab": tab})
    if fr.status_code >= 400:
        return jsonify({"error": "Flight service error"}), 502

    flights = fr.json() if fr.content else []
    pdf_bytes, filename = generate_flights_report_pdf(tab, flights)

    run_in_process(
        send_email,
        admin_email,
        f"PDF izveštaj letova ({tab})",
        f"U prilogu je PDF izveštaj za tab: {tab}\nUkupno letova: {len(flights)}",
        attachments=[(filename, pdf_bytes, "application/pdf")]
    )

    return jsonify({
        "status": "sent",
        "tab": tab,
        "filename": filename,
        "count": len(flights)
    }), 200
