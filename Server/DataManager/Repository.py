from typing import List
from MedicalRecord import MedicalRecord
from Extensions import db


class Repository:
    
    def addRecord(self, record: MedicalRecord) -> None:
        try:
            db.session.add(record)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise Exception("cannot add record")

    def getRecordById(self, id: int) -> MedicalRecord:
        try:
            record: MedicalRecord = MedicalRecord.query.get(id)
        except Exception as err:
            raise Exception("cannot get record")

        if record is None:
            raise Exception("no such record")
        
        return record
    
    def deleteRecord(self, id: int) -> None:
        record: MedicalRecord = self.getRecordById(id)

        if record is None:
            raise Exception("no such record")
        
        try:
            db.session.delete(record)
            db.session.commit()
        except Exception as err:
            db.session.rollback()
            raise Exception("cannot delete record")
    
    def updateRecord(self, record: MedicalRecord) -> None:
        existing: MedicalRecord = self.getRecordById(record.id)

        if record is None:
            raise Exception("no such record")

        existing.copy(record)

        db.session.commit()        

    def getAllRecords(self) -> List[MedicalRecord]:
        try:
            return MedicalRecord.query.all()
        except Exception as err:
            raise Exception("cannot get records")


