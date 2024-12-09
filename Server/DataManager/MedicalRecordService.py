from typing import List, Set
from Repository import Repository
from MedicalRecord import ATTRIBUTES, BASE_ATTRIBUTES, MedicalRecord


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
        att: Set[str] = set(ATTRIBUTES)

        for field in fields:
            if field not in att:
                raise Exception(f"the field '{field}' in not a medical record field")
            
        fieldSet: Set[str] = set(fields)

        records: List[MedicalRecord] = self.repository.getAllRecords()
        dicts: List[dict] = [{field: value for field, value in record.toDict().items() if field in fieldSet}
                             for record in records]

        return dicts
    
    def getVectors(self, fields: List[str] = BASE_ATTRIBUTES) -> List[List[int]]:
        if fields is not BASE_ATTRIBUTES:
            att: Set[str] = set(BASE_ATTRIBUTES)

            for field in fields:
                if field not in att:
                    raise Exception(f"the field '{field}' in not a medical record field")

        records: List[MedicalRecord] = self.repository.getAllRecords()

        dicts: List[dict] = [record.toDict() for record in records]

        vectors: List[List[int]] = [self.dictToVector(d=d, fields=fields) for d in dicts]

        return vectors

    def dictToVector(self, d: dict, fields: List[str]) -> List[int]:
        return [d[field] for field in fields]




