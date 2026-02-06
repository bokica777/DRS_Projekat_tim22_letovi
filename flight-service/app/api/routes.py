from flask import Blueprint, request, jsonify, abort
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
from multiprocessing import Process

from app.db.models import (
    Flight,
    Company,
    FlightStatus,
    ApprovalStatus,
    Ticket,
    Rating,          # <<< DODATO
)
from app.scheduler.tickets_process import process_ticket_purchase

bp = Blueprint("flight_internal", __name__, url_prefix="/internal")


def flight_to_dto(f: Flight):
    return {
        "id": f.id,
        "name": f.name,
        "company": {"id": f.company.id, "name": f.company.name} if f.company else None,
        "distance_km": f.distance_km,
        "duration_sec": f.duration_sec,
        "departure_time": f.departure_time.isoformat() if f.departure_time else None,
        "from_airport": f.from_airport,
        "to_airport": f.to_airport,
        "created_by_user_id": f.created_by_user_id,
        "price": float(f.price),
        "status": f.status.value,
        "approval_status": f.approval_status.value,
        "rejection_reason": f.rejection_reason,
    }


def ticket_to_dto(t: Ticket):
    f = t.flight
    return {
        "id": t.id,
        "user_id": t.user_id,
        "flight_id": t.flight_id,
        "price": float(t.price),
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "flight": flight_to_dto(f) if f else None,
    }


def _enum_member(enum_cls, name: str):
    return getattr(enum_cls, name, None)


# =========================
# COMPANIES
# =========================

@bp.get("/companies")
def list_companies():
    db: Session = request.environ["db"]
    companies = db.query(Company).order_by(Company.id.asc()).all()
    return jsonify([{"id": c.id, "name": c.name} for c in companies]), 200


# =========================
# FLIGHTS
# =========================

@bp.get("/flights")
def list_flights():
    db: Session = request.environ["db"]

    tab = (request.args.get("tab") or "").strip().lower()
    search = (request.args.get("search") or "").strip()
    company_id = (request.args.get("company_id") or "").strip()
    status_q = (request.args.get("status") or "").strip().upper()
    approval_q = (request.args.get("approval_status") or "").strip().upper()
    created_by_user_id = (request.args.get("created_by_user_id") or "").strip()

    q = db.query(Flight).join(Company)

    if tab == "pending":
        q = q.filter(Flight.approval_status == ApprovalStatus.PENDING)

    elif tab == "planned":
        q = q.filter(Flight.status == FlightStatus.PLANNED)
        q = q.filter(Flight.approval_status == ApprovalStatus.APPROVED)

    elif tab == "in_progress":
        q = q.filter(Flight.status == FlightStatus.IN_PROGRESS)
        q = q.filter(Flight.approval_status == ApprovalStatus.APPROVED)

    elif tab == "history":
        q = q.filter(
            or_(
                Flight.status == FlightStatus.FINISHED,
                Flight.status == FlightStatus.CANCELLED,
            )
        )

    elif tab == "cancelled":
        q = q.filter(Flight.status == FlightStatus.CANCELLED)

    if status_q:
        enum_val = _enum_member(FlightStatus, status_q)
        if enum_val:
            q = q.filter(Flight.status == enum_val)

    if approval_q:
        enum_val = _enum_member(ApprovalStatus, approval_q)
        if enum_val:
            q = q.filter(Flight.approval_status == enum_val)

    if company_id:
        try:
            q = q.filter(Flight.company_id == int(company_id))
        except Exception:
            abort(400, "company_id must be int")

    if created_by_user_id:
        q = q.filter(Flight.created_by_user_id == created_by_user_id)

    if search:
        like = f"%{search.lower()}%"
        q = q.filter(
            or_(
                Flight.name.ilike(like),
                Company.name.ilike(like),
                Flight.from_airport.ilike(like),
                Flight.to_airport.ilike(like),
            )
        )

    flights = q.order_by(Flight.departure_time.asc()).all()
    return jsonify([flight_to_dto(f) for f in flights]), 200


@bp.get("/flights/<int:flight_id>")
def get_flight(flight_id: int):
    db: Session = request.environ["db"]
    f = db.get(Flight, flight_id)
    if not f:
        abort(404)
    _ = f.company
    return jsonify(flight_to_dto(f)), 200


@bp.post("/flights")
def create_flight():
    db: Session = request.environ["db"]

    data = request.get_json(force=True) or {}
    required = [
        "name", "company_id", "distance_km", "duration_sec", "departure_time",
        "from_airport", "to_airport", "created_by_user_id", "price"
    ]
    for k in required:
        if k not in data:
            abort(400, f"Missing field {k}")

    company = db.get(Company, int(data["company_id"]))
    if not company:
        abort(400, "Invalid company_id")

    f = Flight(
        name=data["name"],
        company_id=company.id,
        distance_km=int(data["distance_km"]),
        duration_sec=int(data["duration_sec"]),
        departure_time=datetime.fromisoformat(data["departure_time"]),
        from_airport=data["from_airport"],
        to_airport=data["to_airport"],
        created_by_user_id=str(data["created_by_user_id"]),
        price=data["price"],
        status=FlightStatus.PLANNED,
        approval_status=ApprovalStatus.PENDING,
        rejection_reason=None,
    )
    db.add(f)
    db.commit()
    db.refresh(f)
    _ = f.company
    return jsonify(flight_to_dto(f)), 201


# =========================
# APPROVAL
# =========================

@bp.post("/flights/<int:flight_id>/approve")
def approve_flight(flight_id: int):
    db: Session = request.environ["db"]
    f = db.get(Flight, flight_id)
    if not f:
        abort(404)

    if f.approval_status != ApprovalStatus.PENDING:
        abort(409)

    f.approval_status = ApprovalStatus.APPROVED
    f.rejection_reason = None
    db.commit()
    return jsonify(flight_to_dto(f)), 200


@bp.post("/flights/<int:flight_id>/reject")
def reject_flight(flight_id: int):
    db: Session = request.environ["db"]
    f = db.get(Flight, flight_id)
    if not f:
        abort(404)

    reason = (request.json or {}).get("reason", "").strip()
    if not reason:
        abort(400)

    f.approval_status = ApprovalStatus.REJECTED
    f.rejection_reason = reason
    db.commit()
    return jsonify(flight_to_dto(f)), 200


@bp.post("/flights/<int:flight_id>/cancel")
def cancel_flight(flight_id: int):
    db: Session = request.environ["db"]
    f = db.get(Flight, flight_id)
    if not f:
        abort(404)

    if f.status != FlightStatus.PLANNED:
        abort(409)

    f.status = FlightStatus.CANCELLED
    db.commit()
    return jsonify(flight_to_dto(f)), 200


# =========================
# TICKETS
# =========================

@bp.post("/tickets/buy")
def buy_ticket():
    db: Session = request.environ["db"]
    data = request.get_json(force=True) or {}

    user_id = str(data.get("user_id") or "").strip()
    flight_id = data.get("flight_id")

    if not user_id or flight_id is None:
        abort(400)

    f = db.get(Flight, int(flight_id))
    if not f:
        abort(404)

    if f.approval_status != ApprovalStatus.APPROVED:
        abort(409)

    if f.status == FlightStatus.CANCELLED:
        abort(409)

    if f.departure_time.replace(tzinfo=timezone.utc) <= datetime.now(timezone.utc):
        abort(409)

    Process(
        target=process_ticket_purchase,
        args=(user_id, f.id, 5),
        daemon=True
    ).start()

    return jsonify({"message": "Purchase queued"}), 202


@bp.get("/tickets/my")
def my_tickets():
    db: Session = request.environ["db"]
    user_id = str(request.args.get("user_id") or "").strip()
    if not user_id:
        abort(400)

    tickets = (
        db.query(Ticket)
        .filter(Ticket.user_id == user_id)
        .order_by(Ticket.created_at.desc())
        .all()
    )

    for t in tickets:
        _ = t.flight
        if t.flight:
            _ = t.flight.company

    return jsonify([ticket_to_dto(t) for t in tickets]), 200

@bp.get("/tickets/by-flight")
def tickets_by_flight():
    db: Session = request.environ["db"]
    flight_id = (request.args.get("flight_id") or "").strip()
    if not flight_id:
        abort(400, "flight_id is required")

    try:
        fid = int(flight_id)
    except Exception:
        abort(400, "flight_id must be int")

    tickets = db.query(Ticket).filter(Ticket.flight_id == fid).all()
    user_ids = sorted({t.user_id for t in tickets})  # unique
    return jsonify(user_ids), 200

# =========================
# RATINGS  ✅ GOTOVO
# =========================

@bp.post("/ratings")
def create_rating():
    db: Session = request.environ["db"]
    data = request.get_json(force=True) or {}

    user_id = str(data.get("user_id") or "").strip()
    flight_id = data.get("flight_id")
    value = data.get("value")

    if not user_id or flight_id is None or value is None:
        abort(400)

    flight_id = int(flight_id)
    value = int(value)

    if value < 1 or value > 5:
        abort(400)

    flight = db.get(Flight, flight_id)
    if not flight:
        abort(404)

    if flight.status != FlightStatus.FINISHED:
        abort(409)

    ticket = (
        db.query(Ticket)
        .filter(Ticket.user_id == user_id, Ticket.flight_id == flight_id)
        .first()
    )
    if not ticket:
        abort(403)

    exists = (
        db.query(Rating)
        .filter(Rating.user_id == user_id, Rating.flight_id == flight_id)
        .first()
    )
    if exists:
        abort(409)

    r = Rating(user_id=user_id, flight_id=flight_id, value=value)
    db.add(r)
    db.commit()
    db.refresh(r)

    return jsonify({
        "id": r.id,
        "user_id": r.user_id,
        "flight_id": r.flight_id,
        "value": r.value,
        "created_at": r.created_at.isoformat()
    }), 201


@bp.get("/ratings/my")
def my_ratings():
    db: Session = request.environ["db"]
    user_id = str(request.args.get("user_id") or "").strip()
    if not user_id:
        abort(400)

    ratings = (
        db.query(Rating)
        .filter(Rating.user_id == user_id)
        .order_by(Rating.created_at.desc())
        .all()
    )

    return jsonify([
        {
            "flight_id": r.flight_id,
            "value": r.value,
            "created_at": r.created_at.isoformat()
        }
        for r in ratings
    ]), 200


@bp.get("/ratings")
def all_ratings():
    db: Session = request.environ["db"]
    ratings = db.query(Rating).order_by(Rating.created_at.desc()).all()

    return jsonify([
        {
            "user_id": r.user_id,
            "flight_id": r.flight_id,
            "value": r.value,
            "created_at": r.created_at.isoformat()
        }
        for r in ratings
    ]), 200
