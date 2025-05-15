from typing import List
from Server.DataManager.MedicalRecord import MedicalRecord
from Server.DataManager.Extensions import db



class Repository:
    
    def addRecord(self, record: MedicalRecord) -> None:
        try:
            db.session.add(record)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise Exception("cannot add record")

    def getRecordById(self, id: int) -> MedicalRecord:
        try:
            record: MedicalRecord = MedicalRecord.query.get(id)
        except Exception as e:
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
        except Exception as e:
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
        except Exception as e:
            raise Exception("cannot get records")
        
    def getRecordsIds(self) -> List[int]:
        ids: List[int] = [record.id for record in MedicalRecord.query.with_entities(MedicalRecord.id).all()]

        return ids

    def getRecordsWithIds(self, ids: List[int]) -> List[MedicalRecord]:
        records: List[MedicalRecord] = MedicalRecord.query.filter(MedicalRecord.id.in_(ids)).all()

        return records

