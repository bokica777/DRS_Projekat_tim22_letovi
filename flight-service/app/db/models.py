import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Numeric, Enum, Text
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class FlightStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    FINISHED = "FINISHED"
    CANCELLED = "CANCELLED"

class ApprovalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), unique=True, nullable=False)

class Flight(Base):
    __tablename__ = "flights"
    id = Column(Integer, primary_key=True)

    name = Column(String(120), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    company = relationship("Company")

    distance_km = Column(Integer, nullable=False)
    duration_sec = Column(Integer, nullable=False)  # za test npr 60
    departure_time = Column(DateTime(timezone=True), nullable=False)

    from_airport = Column(String(120), nullable=False)
    to_airport = Column(String(120), nullable=False)

    created_by_user_id = Column(String(64), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)

    status = Column(Enum(FlightStatus), nullable=False, default=FlightStatus.PLANNED)
    approval_status = Column(Enum(ApprovalStatus), nullable=False, default=ApprovalStatus.PENDING)
    rejection_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
