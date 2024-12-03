from collections import defaultdict
from typing import Dict, Optional
from MedicalRecord import MedicalRecord


class Repository:

    def __init__(self):
        self.ids: int = 1
        self.records: Dict[int, MedicalRecord] = defaultdict(lambda: None)
    
    def addRecord(self, recordDict: dict) -> None:
        self.records[self.ids] = MedicalRecord(self.ids, recordDict["name"])
        self.ids += 1

    def getRecordById(self, id: int) -> Optional[MedicalRecord]:
        return self.records[id]
    
    def deleteRecord(self, id: int) -> Optional[MedicalRecord]:
        return self.records.pop(id, None)



