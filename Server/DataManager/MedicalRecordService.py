from typing import List, Set
from Repository import Repository
from MedicalRecord import ATTRIBUTES, MedicalRecord


class MedicalRecordService:

    def __init__(self):
        self.repository: Repository = Repository()

    def addRecord(self, recordDict: dict) -> None:
        record: MedicalRecord = MedicalRecord(name=recordDict["name"])
        self.repository.addRecord(record)

    def getRecordById(self, id: int) -> MedicalRecord:
        return self.repository.getRecordById(id)
    
    def deleteRecord(self, id: int) -> None:
        self.repository.deleteRecord(id)

    def updateRecord(self, data: dict) -> None:
        record: MedicalRecord = MedicalRecord(id=data["id"], name=data["name"])

        self.repository.updateRecord(record)

    def getAllRecords(self) -> List[MedicalRecord]:
        return self.repository.getAllRecords()
    
    def getWithFields(self, fields: List[str]) -> List[dict]:
        for field in fields:
            if field not in ATTRIBUTES:
                raise Exception(f"the field '{field}' in not a medical record field")
            
        fieldSet: Set[str] = set(fields)

        records: List[MedicalRecord] = self.repository.getAllRecords()
        dicts: List[dict] = [{field: value for field, value in record.toDict().items() if field in fieldSet}
                             for record in records]

        return dicts




