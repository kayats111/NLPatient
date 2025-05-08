from typing import List
from MedicalRecordText import MedicalRecordText
from Extensions import db

class TextRepository:

    def add_record(self, record: MedicalRecordText) -> None:
        try:
            db.session.add(record)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise Exception("cannot add text record")

    def get_record_by_id(self, id: int) -> MedicalRecordText:
        try:
            record: MedicalRecordText = MedicalRecordText.query.get(id)
        except Exception as e:
            raise Exception("cannot get text record")
        
        if record is None:
            raise Exception("no such record")
        
        return record
        
    def delete_record(self, id: int) -> None:
        record: MedicalRecordText = self.get_record_by_id(id)

        if record is None:
            raise Exception("no such record")
        
        try:
            db.session.delete(record)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise Exception("cannot delete record")

    def update_record(self, record: MedicalRecordText) -> None:
        existing: MedicalRecordText = self.get_record_by_id(record.id)

        if record is None:
            raise Exception("no such record")

        existing.copy(record)

        db.session.commit()   

    def getAllRecords(self) -> List[MedicalRecordText]:
        try:
            return MedicalRecordText.query.all()
        except Exception as e:
            raise Exception("cannot get records")

    











