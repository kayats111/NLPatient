from typing import List
from Repository import Repository
from MedicalRecord import MedicalRecord


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
    
    # adsad


