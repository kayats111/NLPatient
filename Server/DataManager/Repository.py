from collections import defaultdict
from typing import Dict, List, Optional
from MedicalRecord import MedicalRecord


class Repository:

    def __init__(self):
        self.ids: int = 1
        self.records: Dict[int, MedicalRecord] = defaultdict(lambda: None)
    
    def addRecord(self, recordDict: dict) -> None:
        self.records[self.ids] = MedicalRecord(self.ids, recordDict["name"])
        self.ids += 1

    def getRecordById(self, id: int) -> MedicalRecord:
        record: MedicalRecord = self.records[id]

        if record is None:
            raise Exception("no such record")
        
        return record
    
    def deleteRecord(self, id: int) -> None:
        record: MedicalRecord = self.records.pop(id, None)

        if record is None:
            raise Exception("no such record")
    
    def updateRecord(self, record: MedicalRecord) -> None:
        if record.id not in self.records:
            raise Exception("no such record")
        
        self.records[record.id] = record

    def getAllRecords(self) -> List[MedicalRecord]:
        return [record.toDict() for record in self.records.values()]


