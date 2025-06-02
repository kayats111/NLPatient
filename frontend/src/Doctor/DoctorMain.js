import React from 'react';
import { useNavigate } from 'react-router-dom';
import DrawerMenu from '../DrawerMenu'; 
import { useRoleLinks } from "../context/FetchContext";
import './DoctorMain.css'; // ← import the new CSS

function DoctorMain() {
  const navigate = useNavigate();
  const { links } = useRoleLinks();

  const handleButtonClick = (action) => {
    if (action === "Add Patient Data") {
      navigate('/add-patient-data');
    } else if (action === "View Records") {
      navigate('/records-viewer');
    } else if (action === "Add Textual Patient Data") {
      navigate('/textual-upload');
    } else if (action === "View Textual Patient Records") {
      navigate('/view-textual-records');
    }
  };

  const handlePredictClick = () => {
    navigate("/train-page");
  };

  return (
    <div style={styles.container}>
      <DrawerMenu links={links} />

      <h2>Welcome to the Doctors Hub</h2>
      <p>You are now logged in.</p>

      <div style={styles.buttonContainer}>
        <button
          className="my-button"
          onClick={() => handleButtonClick('Add Patient Data')}
        >
          Add Patient Data
        </button>
        <button
          className="my-button"
          onClick={() => handleButtonClick('View Records')}
        >
          View Records
        </button>
        <button
          className="my-button"
          onClick={() => handleButtonClick('Add Textual Patient Data')}
        >
          Add Textual Patient Records
        </button>
        <button
          className="my-button"
          onClick={() => handleButtonClick('View Textual Patient Records')}
        >
          View Textual Records
        </button>
        <button
          className="my-button"
          onClick={() => handlePredictClick()}
        >
          Predict
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f9',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
  },
};

export default DoctorMain;
