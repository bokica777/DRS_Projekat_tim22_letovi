from flask import Blueprint, request, jsonify, abort
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.models import Flight, Company, FlightStatus, ApprovalStatus

bp = Blueprint("flight_internal", __name__, url_prefix="/internal")

def flight_to_dto(f: Flight):
    return {
        "id": f.id,
        "name": f.name,
        "company": {"id": f.company.id, "name": f.company.name},
        "distance_km": f.distance_km,
        "duration_sec": f.duration_sec,
        "departure_time": f.departure_time.isoformat(),
        "from_airport": f.from_airport,
        "to_airport": f.to_airport,
        "created_by_user_id": f.created_by_user_id,
        "price": float(f.price),
        "status": f.status.value,
        "approval_status": f.approval_status.value,
        "rejection_reason": f.rejection_reason,
    }

@bp.post("/flights")
def create_flight():
    # OVO POZIVA SERVER (ne direktno klijent)
    db: Session = request.environ["db"]

    data = request.get_json(force=True)
    required = ["name","company_id","distance_km","duration_sec","departure_time",
                "from_airport","to_airport","created_by_user_id","price"]
    for k in required:
        if k not in data:
            abort(400, f"Missing field {k}")

    company = db.get(Company, int(data["company_id"]))
    if not company:
        abort(400, "Invalid company_id")

    dep = datetime.fromisoformat(data["departure_time"])

    f = Flight(
        name=data["name"],
        company_id=company.id,
        distance_km=int(data["distance_km"]),
        duration_sec=int(data["duration_sec"]),
        departure_time=dep,
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
    return jsonify(flight_to_dto(f)), 201

@bp.post("/flights/<int:flight_id>/approve")
def approve_flight(flight_id: int):
    db: Session = request.environ["db"]
    f = db.get(Flight, flight_id)
    if not f:
        abort(404)

    if f.approval_status != ApprovalStatus.PENDING:
        abort(409, "Flight is not in PENDING state")

    f.approval_status = ApprovalStatus.APPROVED
    f.rejection_reason = None
    db.commit()
    db.refresh(f)
    return jsonify(flight_to_dto(f))

@bp.post("/flights/<int:flight_id>/reject")
def reject_flight(flight_id: int):
    db: Session = request.environ["db"]
    f = db.get(Flight, flight_id)
    if not f:
        abort(404)

    data = request.get_json(force=True)
    reason = (data.get("reason") or "").strip()
    if not reason:
        abort(400, "Rejection reason is required")  # zadatak: razlog odbijanja :contentReference[oaicite:6]{index=6}

    if f.approval_status != ApprovalStatus.PENDING:
        abort(409, "Flight is not in PENDING state")

    f.approval_status = ApprovalStatus.REJECTED
    f.rejection_reason = reason
    db.commit()
    db.refresh(f)
    return jsonify(flight_to_dto(f))

@bp.post("/flights/<int:flight_id>/cancel")
def cancel_flight(flight_id: int):
    db: Session = request.environ["db"]
    f = db.get(Flight, flight_id)
    if not f:
        abort(404)

    # zadatak: otkazivanje ako nije počeo :contentReference[oaicite:7]{index=7}
    if f.status != FlightStatus.PLANNED:
        abort(409, "Only PLANNED flights can be cancelled")

    f.status = FlightStatus.CANCELLED
    db.commit()
    db.refresh(f)
    return jsonify(flight_to_dto(f))
