import os
import time

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

from app.db.models import Base, Company


DB2_URL = os.getenv(
    "DB2_URL",
    "postgresql+psycopg2://postgres:postgres@db2:5432/db2"
)

engine = create_engine(
    DB2_URL,
    pool_pre_ping=True,
    future=True
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)


def init_db():

    for _ in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except OperationalError:
            time.sleep(1)
    else:
        raise RuntimeError("DB2 not ready after 30s")

    with SessionLocal() as db:
        try:
            if db.query(Company).count() == 0:
                db.add_all([
                    Company(name="Air Serbia"),
                    Company(name="Lufthansa"),
                    Company(name="Wizz Air"),
                ])
                db.commit()
        except Exception:
            db.rollback()
            raise
