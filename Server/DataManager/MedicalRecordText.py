from typing import List
from Extensions import db

class MedicalRecordText(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)

    text: str = db.Column(db.Text, unique=False, nullable=False)

    # LABLES
    any: float = db.Column(db.Float, unique=False, nullable=False)
    affective: float = db.Column(db.Float, unique=False, nullable=False)
    bipolar: float = db.Column(db.Float, unique=False, nullable=False)
    schizophreniaSpectr: float = db.Column(db.Float, unique=False, nullable=False)

    def __init__(self, text: str, _any: float, affective: float, bipolar: float, schizophreniaSpectr: float):
        super().__init__()

        self.text = text
        self.any = _any
        self.affective = affective
        self.bipolar = bipolar
        self.schizophreniaSpectr = schizophreniaSpectr

    def toDict(self) -> dict:
        return {column.name: getattr(self, column.name, None) for column in MedicalRecordText.__table__.columns}
    
    def copy(self, other: 'MedicalRecordText') -> None:
        for column in MedicalRecordText.__table__.columns:
            field_name: str = column.name
            if field_name != "id":
                setattr(self, field_name, getattr(other, field_name, None))

    def get_label(self, labels: List[str]) -> List[float]:
        label: List[float] = []

        if "any" in labels:
            label.append(self.any)
        if "affective" in labels:
            label.append(self.affective)
        if "bipolar" in labels:
            label.append(self.bipolar)
        if "schizophreniaSpectr" in labels:
            label.append(self.schizophreniaSpectr)

        return label



ATTRIBUTES: List[str] = [column.name for column in MedicalRecordText.__table__.columns]
BASE_ATTRIBUTES: List[str] = [column.name for column in MedicalRecordText.__table__.columns if column.name != "id"]
LABELS: List[str] = ["any", "affective", "bipolar", "schizophreniaSpectr"]
TRAIN_ATTRIBUTES: List[str] = ["text"]



