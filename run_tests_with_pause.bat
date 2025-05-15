
@echo off
echo 📦 Creating virtual environment...
python -m venv venv

echo 📂 Activating virtual environment...
call venv\Scripts\activate

echo ⬇️ Installing dependencies...
pip install --upgrade pip
pip install flask flask_sqlalchemy flask_pymongo pymongo pytest

echo ✅ Running tests...
pytest NLPatient-tests\tests --tb=short -q > test_results.txt

echo 🧹 Deactivating environment...
deactivate

echo 📄 Test results saved to test_results.txt

pause
