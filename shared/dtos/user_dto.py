class UserDTO:
    def __init__(
        self,
        id: int,
        email: str,
        first_name: str,
        last_name: str,
        role: str
    ):
        self.id = id
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.role = role
