import time
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import sessionmaker
from app.db.models import Flight, FlightStatus, ApprovalStatus

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
                start = f.departure_time
                end = start + timedelta(seconds=f.duration_sec)

                if f.status == FlightStatus.PLANNED and start <= now:
                    f.status = FlightStatus.IN_PROGRESS
                    changed = True
                elif f.status == FlightStatus.IN_PROGRESS and end <= now:
                    f.status = FlightStatus.FINISHED
                    changed = True

            if changed:
                db.commit()

        time.sleep(1)
