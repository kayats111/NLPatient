from typing import List
from Extensions import db

class MedicalRecord(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    
    # FIELDS
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
    traditionalTreat: float = db.Column(db.Float, unique=False, nullable=False)
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




    def __init__(self, codingNum: float, yearOfEvent: float, age: float, gender: float, sector: float, origin: float,
                 originGroup: float, immigrationYear: float, LMSSocialStateScore: float, clalitMember: float,
                 parentState: float, parentStateGroup: float, livingWith: float, livingWithGroup: float, siblingsTotal: float,
                 numInSiblings: float, familyHistoryMH: float, school: float, schoolGroup: float, prodrom: float, prodGroup: float,
                 posLengthGroup: float, psLengthG2: float, vocalHallucinations: float, visualHallucinations: float,
                 dellusions: float, disorgenizeBahaviour: float, thoughtProcess: float, speechSym: float, negSigns: float,
                 sleepDisorder: float, catatonia: float, maniformSym: float, depressizeSym: float, drugUseCurrent: float,
                 traditionalTreat: float, violence: float, irritabilityanamneza: float, suicidal: float, organicworkup: float,
                 conhospi: float, any: float, affective: float, bipolar: float, schizophreniaSpectr: float):
        
        super().__init__()

        self.codingNum = codingNum
        self.yearOfEvent = yearOfEvent
        self.age = age
        self.gender = gender
        self.sector = sector
        self.origin = origin
        self.originGroup = originGroup
        self.immigrationYear = immigrationYear
        self.LMSSocialStateScore = LMSSocialStateScore
        self.clalitMember = clalitMember
        self.parentState = parentState
        self.parentStateGroup = parentStateGroup
        self.livingWith = livingWith
        self.livingWithGroup = livingWithGroup
        self.siblingsTotal = siblingsTotal
        self.numInSiblings = numInSiblings
        self.familyHistoryMH = familyHistoryMH
        self.school = school
        self.schoolGroup = schoolGroup
        self.prodrom = prodrom
        self.prodGroup = prodGroup
        self.posLengthGroup = posLengthGroup
        self.psLengthG2 = psLengthG2
        self.vocalHallucinations = vocalHallucinations
        self.visualHallucinations = visualHallucinations
        self.dellusions = dellusions
        self.disorgenizeBahaviour = disorgenizeBahaviour
        self.thoughtProcess = thoughtProcess
        self.speechSym = speechSym
        self.negSigns = negSigns
        self.sleepDisorder = sleepDisorder
        self.catatonia = catatonia
        self.maniformSym = maniformSym
        self.depressizeSym = depressizeSym
        self.drugUseCurrent = drugUseCurrent
        self.traditionalTreat = traditionalTreat
        self.violence = violence
        self.irritabilityanamneza = irritabilityanamneza
        self.suicidal = suicidal
        self.organicworkup = organicworkup
        self.conhospi = conhospi
        self.any = any
        self.affective = affective
        self.bipolar = bipolar
        self.schizophreniaSpectr = schizophreniaSpectr
   
    def copy(self, other: 'MedicalRecord') -> None:
        for column in MedicalRecord.__table__.columns:
            field_name: str = column.name
            if field_name != "id":
                setattr(self, field_name, getattr(other, field_name, None))

    def toDict(self) -> dict:
        return {column.name: getattr(self, column.name, None) for column in MedicalRecord.__table__.columns}
    
ATTRIBUTES: List[str] = [column.name for column in MedicalRecord.__table__.columns]
LABELS: List[str] = ["any", "affective", "bipolar", "schizophreniaSpectr"]
BASE_ATTRIBUTES: List[str] = [column.name for column in MedicalRecord.__table__.columns
                              if (column.name is not "id" and column.name is not "codingNum"
                                  and column.name not in LABELS)]
    


