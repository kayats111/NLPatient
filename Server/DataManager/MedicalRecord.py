from typing import Set
from Extensions import db

class MedicalRecord(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    name: str = db.Column(db.String(20), unique=False, nullable=False)

    def __init__(self, name: str, id: int = -1):
        super().__init__()
        self.id = id
        self.name = name

    def toDict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name
        }
    
ATTRIBUTES: Set[str] = {"id", "name"}
BASE_ATTRIBUTES: Set[str] = {"name"}
    


