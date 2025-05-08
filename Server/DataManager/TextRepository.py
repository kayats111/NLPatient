from typing import List
from MedicalRecordText import MedicalRecordText
from Extensions import db

class TextRepository:

    def addRecord(self, record: MedicalRecordText) -> None:
        try:
            db.session.add(record)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise Exception("cannot add text record")
    