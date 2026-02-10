import time
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import sessionmaker
from zoneinfo import ZoneInfo

from app.db.models import Flight, FlightStatus, ApprovalStatus

LOCAL_TZ = ZoneInfo("Europe/Belgrade")


def _as_utc(dt):
    """
    departure_time iz baze može nekad doći kao:
    - timezone-aware (timestamp with time zone) -> samo prebacimo u UTC
    - naive (bez tzinfo) -> u praksi je to najčešće lokalno vreme (Europe/Belgrade),
      pa ga prvo "obeležimo" kao lokalno, pa konvertujemo u UTC.
    """
    if dt is None:
        return None

    if dt.tzinfo is None:
        # NAJBITNIJI FIX: naive tretiramo kao lokalno vreme
        dt = dt.replace(tzinfo=LOCAL_TZ)

    return dt.astimezone(timezone.utc)


def run_status_updater(engine):
    Session = sessionmaker(bind=engine)

    while True:
        now = datetime.now(timezone.utc)

        with Session() as db:
            flights = (
                db.query(Flight)
                .filter(
                    Flight.approval_status == ApprovalStatus.APPROVED,
                    Flight.status.in_([FlightStatus.PLANNED, FlightStatus.IN_PROGRESS]),
                )
                .all()
            )

            changed = False

            for f in flights:
                start = _as_utc(f.departure_time)
                if start is None:
                    continue

                end = start + timedelta(seconds=int(f.duration_sec or 0))

                # PLANNED -> IN_PROGRESS
                if f.status == FlightStatus.PLANNED and now >= start:
                    f.status = FlightStatus.IN_PROGRESS
                    changed = True

                # IN_PROGRESS -> FINISHED
                if f.status == FlightStatus.IN_PROGRESS and now >= end:
                    f.status = FlightStatus.FINISHED
                    changed = True

            if changed:
                db.commit()

        time.sleep(1)
