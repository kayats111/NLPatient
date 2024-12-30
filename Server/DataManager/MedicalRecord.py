from typing import List
from Extensions import db

class MedicalRecord(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    field1: float = db.Column(db.Float, unique=False, nullable=False)
    field2: float = db.Column(db.Float, unique=False, nullable=False)
    field3: float = db.Column(db.Float, unique=False, nullable=False)
    field4: float = db.Column(db.Float, unique=False, nullable=False)
    label: float = db.Column(db.Float, unique=False, nullable=False)

    def __init__(self, field1: float, field2: float, field3: float, field4: float, label: float):
        super().__init__()
        # self.id = id
        self.field1 = field1
        self.field2 = field2
        self.field3 = field3
        self.field4 = field4
        self.label = label

    def copy(self, other: 'MedicalRecord') -> None:
        for column in MedicalRecord.__table__.columns:
            field_name: str = column.name
            if field_name != "id":
                setattr(self, field_name, getattr(other, field_name, None))

    def toDict(self) -> dict:
        return {
            "id": self.id,
            "field1": self.field1,
            "field2": self.field1,
            "field3": self.field3,
            "field4": self.field4,
            "label": self.label
        }
    
ATTRIBUTES: List[str] = ["id", "field1", "field2", "field3", "field4", "label"]
BASE_ATTRIBUTES: List[str] = ["field1", "field2", "field3", "field4", "label"]
    


