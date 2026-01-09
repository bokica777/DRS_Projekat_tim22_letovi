class FlightDTO:
    def __init__(
        self,
        id: int,
        name: str,
        airline: str,
        price: float,
        departure: str,
        arrival: str
    ):
        self.id = id
        self.name = name
        self.airline = airline
        self.price = price
        self.departure = departure
        self.arrival = arrival
