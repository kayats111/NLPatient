from typing import List
from Extensions import db

class MedicalRecord(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    field1: float = db.Column(db.Float, unique=False, nullable=False)
    field2: float = db.Column(db.Float, unique=False, nullable=False)
    field3: float = db.Column(db.Float, unique=False, nullable=False)
    field4: float = db.Column(db.Float, unique=False, nullable=False)

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
            "field": self.field1,
            "field": self.field1,
            "field": self.field3,
            "field": self.field4
        }
    
ATTRIBUTES: List[str] = ["id", "field1", "field2", "field3", "field4"]
BASE_ATTRIBUTES: List[str] = ["field1", "field2", "field3", "field4"]
    


