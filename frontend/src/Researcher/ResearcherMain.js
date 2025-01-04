import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

function ResearcherMain() {
  const navigate = useNavigate(); // Use the hook for navigation
  const handleButtonClick = (action) => {
    console.log(`${action} button clicked`);
    if(action ==="Train Model"){
      navigate("/train-page")
    }
    // You can replace the console log with actual functionality
    // for each button based on the app's requirements
  };

  return (
    <div style={styles.container}>
      <h2>Welcome to the Researcher Hub</h2>
      <p>You are now logged in.</p>

      <div style={styles.buttonContainer}>
        <button
          onClick={() => handleButtonClick('Add Model')}
          style={styles.button}
        >
          Add Model
        </button>
        <button
          onClick={() => handleButtonClick('Remove Model')}
          style={styles.button}
        >
          Remove Model
        </button>
        <button
          onClick={() => handleButtonClick('Update Model')}
          style={styles.button}
        >
          Update Model
        </button>
        <button
          onClick={() => handleButtonClick('Train Model')}
          style={styles.button}
        >
          Train Model
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
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '200px',  // Adjust button size
  },
};

export default ResearcherMain;
