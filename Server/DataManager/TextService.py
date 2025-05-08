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

    def delete_record(self, id: int) -> None:
        self.repository.delete_record(id)

    def update_record(self, data: dict) -> None:
        record: MedicalRecordText = self.record_from_dict(record_dict=data)
        record.id = data["id"]

        self.repository.update_record(record)

    def get_all_records_read(self) -> List[MedicalRecordText]:
        return self.repository.get_all_records()

    def get_all_records_train(self, labels: List[str]) -> Dict[str, list]:
        records: List[MedicalRecordText] = self.repository.get_all_records()

        data: Dict[str, list] = {}
        data["text"] = []
        data["label"] = []

        for record in records:
            data["text"].append(record.text)
            data["label"].append(record.get_label(labels=labels))

        return data

    def record_from_dict(self, record_dict: dict) -> MedicalRecordText:
        record: MedicalRecordText = MedicalRecordText(text=record_dict["text"],
                                                      text=record_dict["any"],
                                                      text=record_dict["affective"],
                                                      text=record_dict["bipolar"],
                                                      text=record_dict["schizophreniaSpectr"])
        return record
    
    def get_train_fields_and_labels(self) -> Dict[str, List[str]]:
        return {
            "fields": TRAIN_ATTRIBUTES,
            "labels": LABELS
        }







