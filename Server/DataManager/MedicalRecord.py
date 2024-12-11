from typing import List
from Extensions import db

class MedicalRecord(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    name: int = db.Column(db.String(20), unique=False, nullable=False)

    def __init__(self, name: int):
        super().__init__()
        # self.id = id
        self.name = name

    def copy(self, other: 'MedicalRecord') -> None:
        for column in MedicalRecord.__table__.columns:
            field_name: str = column.name
            if field_name != "id":
                setattr(self, field_name, getattr(other, field_name, None))

    def toDict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name
        }
    
ATTRIBUTES: List[str] = {"id", "name"}
BASE_ATTRIBUTES: List[str] = {"name"}
    


