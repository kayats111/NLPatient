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
        







