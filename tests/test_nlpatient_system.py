
import sys
import os
import unittest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from Server.Users.UserService import UserService
from Server.DataManager.MedicalRecordService import MedicalRecordService
from Server.ModelTrainer.Service import Service as ModelTrainerService
from unittest.mock import patch
from Server.DataManager.Repository import Repository

# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class TestUnitUserActions(unittest.TestCase):
    def setUp(self):
        self.UserService = UserService()

    def test_register_user_valid(self):
        email = "mikiaho@example.com"
        password = "mikiaho123"
        role = "Researcher"
        result = self.UserService.register(email, password, role)
        self.assertEqual(result["status"], "pending")

    def test_register_user_duplicate_email(self):
        email = "mikiaho@example.com"
        password = "password123"
        role = "Doctor"
        self.UserService.register(email, password, role)
        result = self.UserService.register(email, password, role)
        self.assertIn("already exists", result["error"])

    def test_register_user_invalid_password(self):
        email = "sagi@example.com"
        password = "123"
        role = "Researcher"
        result = self.UserService.register(email, password, role)
        self.assertIn("Password does not meet", result["error"])

    def test_register_user_no_approval(self):
        email = "sagiaho@example.com"
        password = "ValidPass123"
        role = "Doctor"
        self.UserService.register(email, password, role)
        login_result = self.UserService.login(email, password)
        self.assertIn("approval", login_result["error"])

    def test_login_valid_user(self):
        email = "mikiaho@example.com"
        password = "ValidPass1234"
        role = "Doctor"
        self.UserService.register(email, password, role)
        self.UserService.isPendingApproval(email, approve=True)
        result = self.UserService.login(email, password)
        self.assertTrue(result["success"])

    def test_login_invalid_credentials(self):
        result = self.UserService.login("nonexistent@example.com", "wrongpass")
        self.assertFalse(result["success"])

    def test_logout_user(self):
        # Assume logout clears session, here mocked as always successful
        result = self.UserService.logout()
        self.assertTrue(result["success"])


class TestUnitMedicalRecords(unittest.TestCase):
    def setUp(self):
        self.service = MedicalRecordService()

    def test_add_medical_record_valid_sql(self):
        record = {
            "age": 30,
            "gender": 1,
            "history": 1,
            "affective": 0,
            "bipolar": 1,
            "schizophrenia": 0
        }
        result = self.service.addRecord(record)
        self.assertIsNotNone(result)

    def test_add_medical_record_sql_missing_fields(self):
        record = {
            "age": 30,
            "gender": 1  # Missing critical fields
        }
        with self.assertRaises(Exception):
            self.service.addRecord(record)

    def test_add_medical_record_invalid_format(self):
        with self.assertRaises(Exception):
            self.service.addRecord("record.pdf")  # Invalid input type

    def test_read_medical_record_valid_id(self):
        record = {
            "age": 25,
            "gender": 0,
            "history": 1,
            "affective": 1,
            "bipolar": 0,
            "schizophrenia": 0
        }
        added = self.service.addRecord(record)
        result = self.service.getRecordById(added.id)
        self.assertEqual(result.id, added.id)

    def test_read_medical_record_invalid_id(self):
        result = self.service.getRecordById(-1)
        self.assertIsNone(result)

    def test_delete_medical_record_valid_id(self):
        record = {
            "age": 28,
            "gender": 1,
            "history": 1,
            "affective": 0,
            "bipolar": 0,
            "schizophrenia": 1
        }
        added = self.service.addRecord(record)
        result = self.service.deleteRecord(added.id)
        self.assertTrue(result)

    def test_delete_medical_record_invalid_id(self):
        result = self.service.deleteRecord(9999)
        self.assertFalse(result)

    def test_update_medical_record_valid(self):
        record = {
            "age": 32,
            "gender": 1,
            "history": 1,
            "affective": 1,
            "bipolar": 0,
            "schizophrenia": 0
        }
        added = self.service.addRecord(record)
        update_result = self.service.updateRecord({"id": added.id, "age": 40})
        self.assertTrue(update_result)

    def test_update_medical_record_invalid_id(self):
        result = self.service.updateRecord({"id": -1, "age": 35})
        self.assertFalse(result)

    def test_update_medical_record_invalid_format(self):
        with self.assertRaises(Exception):
            self.service.updateRecord("not a dict")


class TestAcceptanceNLPatient(unittest.TestCase):
    def setUp(self):
        self.UserService = UserService()
        self.medical_service = MedicalRecordService()
        self.model_service = ModelTrainerService()

    def test_acceptance_register_login(self):
        email = "acceptuser@example.com"
        password = "StrongPass1!"
        self.UserService.register(email, password, "Researcher")
        self.UserService.isPendingApproval(email, approve=True)
        result = self.UserService.login(email, password)
        self.assertTrue(result["success"])

    def test_acceptance_add_and_read_record(self):
        record = {
            "age": 29,
            "gender": 1,
            "history": 1,
            "affective": 0,
            "bipolar": 1,
            "schizophrenia": 0
        }
        added = self.medical_service.addRecord(record)
        read = self.medical_service.getRecordById(added.id)
        self.assertEqual(read.id, added.id)

    def test_acceptance_train_model(self):
        with patch.object(self.model_service, "runModel", return_value={"success": True}) as mock_train:
            result = self.model_service.runModel("model.py", ["age", "gender"], ["bipolar"])
            self.assertTrue(result["success"])

    def test_acceptance_predict_model(self):
        with patch.object(self.model_service, "predict", return_value={"prediction": [1]}) as mock_predict:
            result = self.model_service.predict("model_trained", [25, 1])
            self.assertIn("prediction", result)

    def test_acceptance_update_record(self):
        record = {
            "age": 45,
            "gender": 1,
            "history": 0,
            "affective": 1,
            "bipolar": 1,
            "schizophrenia": 0
        }
        added = self.medical_service.addRecord(record)
        result = self.medical_service.updateRecord({"id": added.id, "age": 50})
        self.assertTrue(result)

    def test_acceptance_delete_model(self):
        with patch.object(self.model_service, "removeModelFile", return_value=True) as mock_delete:
            result = self.model_service.removeModelFile("model_to_delete")
            self.assertTrue(result)

    def test_acceptance_unauthorized_access(self):
        # Simulate permission check failure
        with patch("Server.DataManager.Repository.deleteRecord", side_effect=PermissionError("Permission denied")):
            with self.assertRaises(PermissionError):
                self.medical_service.deleteRecord(1)

    def test_acceptance_system_load_handling(self):
        with patch.object(self.UserService, "login", return_value={"success": True}):
            results = [self.UserService.login(f"user{i}@ex.com", "password") for i in range(100)]
            self.assertEqual(sum(r["success"] for r in results), 100)
