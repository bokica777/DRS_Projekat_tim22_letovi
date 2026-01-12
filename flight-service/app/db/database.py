import os
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

from app.db.models import Base, Company  # <- BITNO

DB2_URL = os.getenv(
    "DB2_URL",
    "postgresql+psycopg2://postgres:postgres@db2:5432/db2"
)

engine = create_engine(DB2_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def init_db():
    # retry jer db2 nekad nije spreman odmah
    for i in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except OperationalError:
            time.sleep(1)
    else:
        raise RuntimeError("DB2 not ready after 30s")

    # seed kompanija
    with SessionLocal() as db:
        if db.query(Company).count() == 0:
            db.add_all([
                Company(name="Air Serbia"),
                Company(name="Lufthansa"),
                Company(name="Wizz Air"),
            ])
            db.commit()
