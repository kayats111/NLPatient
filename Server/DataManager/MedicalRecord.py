from typing import List
from Extensions import db

class MedicalRecord(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    name: int = db.Column(db.String(20), unique=False, nullable=False)

    def __init__(self, name: int, id: int = -1):
        super().__init__()
        self.id = id
        self.name = name

    def toDict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name
        }
    
ATTRIBUTES: List[str] = {"id", "name"}
BASE_ATTRIBUTES: List[str] = {"name"}
    


