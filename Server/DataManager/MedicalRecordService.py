from typing import List, Set
from Repository import Repository
from MedicalRecord import ATTRIBUTES, LABELS, TRAIN_ATTRIBUTES, MedicalRecord


class MedicalRecordService:

    def __init__(self):
        self.repository: Repository = Repository()

    def addRecord(self, recordDict: dict) -> None:
        record: MedicalRecord = self.recordFromDict(recordDict=recordDict)
        self.repository.addRecord(record)

    def getRecordById(self, id: int) -> MedicalRecord:
        return self.repository.getRecordById(id)
    
    def deleteRecord(self, id: int) -> None:
        self.repository.deleteRecord(id)

    def updateRecord(self, data: dict) -> None:
        record: MedicalRecord = self.recordFromDict(recordDict=data)
        record.id = data["id"]

        self.repository.updateRecord(record)

    def getAllRecords(self) -> List[MedicalRecord]:
        return self.repository.getAllRecords()
    
    def getWithFields(self, fields: List[str]) -> List[dict]:
        att: Set[str] = set(ATTRIBUTES)

        for field in fields:
            if field not in att:
                raise Exception(f"the field '{field}' in not a medical record field")
            
        fieldSet: Set[str] = set(fields)

        records: List[MedicalRecord] = self.repository.getAllRecords()
        dicts: List[dict] = [{field: value for field, value in record.toDict().items() if field in fieldSet}
                             for record in records]

        return dicts
    
    def getVectors(self, fields: List[str] = TRAIN_ATTRIBUTES, labels: List[str] = LABELS) -> List[List[float]]:
        if fields is not TRAIN_ATTRIBUTES:
            att: Set[str] = set(TRAIN_ATTRIBUTES)

            for field in fields:
                if field not in att:
                    raise Exception(f"the field '{field}' in not a medical record field")
                
        if labels is not LABELS:
            lbl: Set[str] = set(LABELS)

        for label in labels:
            if label not in lbl:
                raise Exception(f"the label '{field}' in not a medical record label")

        records: List[MedicalRecord] = self.repository.getAllRecords()

        dicts: List[dict] = [record.toDict() for record in records]

        vectors: List[List[float]] = [self.dictToVector(d=d, fields=fields, labels=labels) for d in dicts]

        return vectors

    def dictToVector(self, d: dict, fields: List[str], labels: List[str]) -> List[int]:
        take: List[str] = fields + labels
        return [d[att] for att in take]

    def recordFromDict(self, recordDict: dict) -> MedicalRecord:
        record: MedicalRecord = MedicalRecord(codingNum=recordDict["codingNum"],
                                              yearOfEvent=recordDict["yearOfEvent"],
                                              age=recordDict["age"],
                                              gender=recordDict["gender"],
                                              sector=recordDict["sector"],
                                              origin=recordDict["origin"],
                                              originGroup=recordDict["originGroup"],
                                              immigrationYear=recordDict["immigrationYear"],
                                              LMSSocialStateScore=recordDict["LMSSocialStateScore"],
                                              clalitMember=recordDict["clalitMember"],
                                              parentState=recordDict["parentState"],
                                              parentStateGroup=recordDict["parentStateGroup"],
                                              livingWith=recordDict["livingWith"],
                                              livingWithGroup=recordDict["livingWithGroup"],
                                              siblingsTotal=recordDict["siblingsTotal"],
                                              numInSiblings=recordDict["numInSiblings"],
                                              familyHistoryMH=recordDict["familyHistoryMH"],
                                              school=recordDict["school"],
                                              schoolGroup=recordDict["schoolGroup"],
                                              prodrom=recordDict["prodrom"],
                                              prodGroup=recordDict["prodGroup"],
                                              posLengthGroup=recordDict["posLengthGroup"],
                                              psLengthG2=recordDict["psLengthG2"],
                                              vocalHallucinations=recordDict["vocalHallucinations"],
                                              visualHallucinations=recordDict["visualHallucinations"],
                                              dellusions=recordDict["dellusions"],
                                              disorgenizeBahaviour=recordDict["disorgenizeBahaviour"],
                                              thoughtProcess=recordDict["thoughtProcess"],
                                              speechSym=recordDict["speechSym"],
                                              negSigns=recordDict["negSigns"],
                                              sleepDisorder=recordDict["sleepDisorder"],
                                              catatonia=recordDict["catatonia"],
                                              maniformSym=recordDict["maniformSym"],
                                              depressizeSym=recordDict["depressizeSym"],
                                              drugUseCurrent=recordDict["drugUseCurrent"],
                                              drugUseHistory=recordDict["drugUseHistory"],
                                              traditionalTreat=recordDict["traditionalTreat"],
                                              violence=recordDict["violence"],
                                              irritabilityAnamneza=recordDict["irritabilityAnamneza"],
                                              suicidal=recordDict["suicidal"],
                                              organicworkup=recordDict["organicworkup"],
                                              conhospi=recordDict["conhospi"],
                                              any=recordDict["any"],
                                              affective=recordDict["affective"],
                                              bipolar=recordDict["bipolar"],
                                              schizophreniaSpectr=recordDict["schizophreniaSpectr"])
        
        return record


