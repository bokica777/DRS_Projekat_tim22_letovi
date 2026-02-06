import time
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import sessionmaker
from app.db.models import Flight, FlightStatus, ApprovalStatus


def _as_utc(dt):
    # Ako je naive -> tretiraj kao UTC
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    # Ako ima tz -> prebaci u UTC
    return dt.astimezone(timezone.utc)


def run_status_updater(engine):
    Session = sessionmaker(bind=engine)

    while True:
        now = datetime.now(timezone.utc)

        with Session() as db:
            flights = db.query(Flight).filter(
                Flight.approval_status == ApprovalStatus.APPROVED,
                Flight.status.in_([FlightStatus.PLANNED, FlightStatus.IN_PROGRESS])
            ).all()

            changed = False

            for f in flights:
                start = _as_utc(f.departure_time)
                end = start + timedelta(seconds=int(f.duration_sec or 0))

                # ✅ Ako smo već posle starta, odmah pređi u IN_PROGRESS
                if f.status == FlightStatus.PLANNED and now >= start:
                    f.status = FlightStatus.IN_PROGRESS
                    changed = True

                # ✅ Ako smo posle kraja, završava se
                if f.status == FlightStatus.IN_PROGRESS and now >= end:
                    f.status = FlightStatus.FINISHED
                    changed = True

            if changed:
                db.commit()

        time.sleep(1)
