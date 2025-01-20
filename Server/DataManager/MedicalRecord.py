from typing import List
from Extensions import db

class MedicalRecord(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    
    # fields
    codingNum: float = db.Column(db.Float, unique=False, nullable=False)
    yearOfEvent: float = db.Column(db.float, unique=False, nullable=False)
    age: float = db.Column(db.Float, unique=False, nullable=False)
    gender: float = db.Column(db.Float, unique=False, nullable=False)
    sector: float = db.Column(db.Float, unique=False, nullable=False)
    origin: float = db.Column(db.Float, unique=False, nullable=False)
    originGroup: float = db.Column(db.Float, unique=False, nullable=False)
    immigrationYear: float = db.Column(db.Float, unique=False, nullable=False)
    LMSSocialStateScore: float = db.Column(db.Float, unique=False, nullable=False)
    clalitMember: float = db.Column(db.Float, unique=False, nullable=False)
    parentState: float = db.Column(db.Float, unique=False, nullable=False)
    parentStateGroup: float = db.Column(db.Float, unique=False, nullable=False)
    livingWith: float = db.Column(db.Float, unique=False, nullable=False)
    livingWithGroup: float = db.Column(db.Float, unique=False, nullable=False)
    siblingsTotal: float = db.Column(db.Float, unique=False, nullable=False)
    numInSiblings: float = db.Column(db.Float, unique=False, nullable=False)
    familyHistoryMH: float = db.Column(db.Float, unique=False, nullable=False)
    school: float = db.Column(db.Float, unique=False, nullable=False)
    schoolGroup: float = db.Column(db.Float, unique=False, nullable=False)
    prodrom: float = db.Column(db.Float, unique=False, nullable=False)
    prodGroup: float = db.Column(db.Float, unique=False, nullable=False)
    posLengthGroup: float = db.Column(db.Float, unique=False, nullable=False)
    psLengthG2: float = db.Column(db.Float, unique=False, nullable=False)
    vocalHallucinations: float = db.Column(db.Float, unique=False, nullable=False)
    visualHallucinations: float = db.Column(db.Float, unique=False, nullable=False)
    dellusions: float = db.Column(db.Float, unique=False, nullable=False)
    disorgenizeBahaviour: float = db.Column(db.Float, unique=False, nullable=False)
    thoughtProcess: float = db.Column(db.Float, unique=False, nullable=False)
    speechSym: float = db.Column(db.Float, unique=False, nullable=False)
    negSigns: float = db.Column(db.Float, unique=False, nullable=False)
    sleepDisorder: float = db.Column(db.Float, unique=False, nullable=False)
    catatonia: float = db.Column(db.Float, unique=False, nullable=False)
    maniformSym: float = db.Column(db.Float, unique=False, nullable=False)
    depressizeSym: float = db.Column(db.Float, unique=False, nullable=False)
    drugUseCurrent: float = db.Column(db.Float, unique=False, nullable=False)
    drugUseHistory: float = db.Column(db.Float, unique=False, nullable=False)
    traditreat: float = db.Column(db.Float, unique=False, nullable=False)
    violence: float = db.Column(db.Float, unique=False, nullable=False)
    irritabilityanamneza: float = db.Column(db.Float, unique=False, nullable=False)
    suicidal: float = db.Column(db.Float, unique=False, nullable=False)
    # backdiagnos: float = db.Column(db.Float, unique=False, nullable=False)
    organicworkup: float = db.Column(db.Float, unique=False, nullable=False)
    conhospi: float = db.Column(db.Float, unique=False, nullable=False)

    # LABELS
    any: float = db.Column(db.Float, unique=False, nullable=False)
    affective: float = db.Column(db.Float, unique=False, nullable=False)
    bipolar: float = db.Column(db.Float, unique=False, nullable=False)
    schizophreniaSpectr: float = db.Column(db.Float, unique=False, nullable=False)




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
    


