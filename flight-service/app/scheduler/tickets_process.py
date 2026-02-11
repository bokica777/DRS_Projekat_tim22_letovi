import os
import time
from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.models import Flight, Ticket, ApprovalStatus, FlightStatus


def process_ticket_purchase(user_id: str, flight_id: int, sleep_seconds: int = 5) -> None:
   
    db2_url = os.getenv(
        "DB2_URL",
        "postgresql+psycopg2://postgres:postgres@db2:5432/db2"
    )

    engine = create_engine(db2_url, pool_pre_ping=True, future=True)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)

    time.sleep(sleep_seconds)

    with SessionLocal() as db:
        flight = db.get(Flight, int(flight_id))
        if not flight:
            return

        if flight.approval_status != ApprovalStatus.APPROVED:
            return

        cancelled = getattr(FlightStatus, "CANCELLED", None)
        if cancelled is not None and flight.status == cancelled:
            return

        t = Ticket(
            user_id=str(user_id),
            flight_id=int(flight_id),
            price=flight.price,
            created_at=datetime.utcnow()
        )
        db.add(t)
        db.commit()
