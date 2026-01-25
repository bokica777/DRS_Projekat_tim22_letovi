from .db import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(db.String(60), nullable=False)
    last_name = db.Column(db.String(60), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)

    birth_date = db.Column(db.String(20), nullable=False)   # za sad string
    gender = db.Column(db.String(10), nullable=False)

    country = db.Column(db.String(60), nullable=False)
    street = db.Column(db.String(120), nullable=False)
    number = db.Column(db.String(20), nullable=False)

    balance = db.Column(db.Float, nullable=False, default=0.0)

    role = db.Column(db.String(20), nullable=False, default="KORISNIK")  # KORISNIK/MENADZER/ADMIN
    password_hash = db.Column(db.String(255), nullable=False)

    # polja za blokadu login-a (da koleginica iz A dela koristi)
    failed_login_count = db.Column(db.Integer, nullable=False, default=0)
    lock_until = db.Column(db.String(40), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            "birthDate": self.birth_date,
            "gender": self.gender,
            "country": self.country,
            "street": self.street,
            "number": self.number,
            "balance": self.balance,
            "role": self.role,
        }
