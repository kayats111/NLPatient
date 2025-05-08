from typing import Dict, List, Set
from TextRepository import TextRepository
from MedicalRecordText import ATTRIBUTES, LABELS, TRAIN_ATTRIBUTES, MedicalRecordText

class TextService:

    def __init__(self):
        self.repository: TextRepository = TextRepository()

    def add_record(self, record_dict: dict) -> None:
        record: MedicalRecordText = self.record_from_dict(record_dict=record_dict)
        self.repository.add_record(record)

    def get_record_by_id(self, id: int) -> MedicalRecordText:
        return self.repository.get_record_by_id(id)
















