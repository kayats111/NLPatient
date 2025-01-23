import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

function ResearcherMain() {
  const navigate = useNavigate(); // Use the hook for navigation
  const fakehandleDownload = () => {
    alert('fake handle download');
  };
  // const handleDownload = async () => {
  //   try {
  //     const response = await fetch("http://localhost:5000/download/template");
  //     if (!response.ok) {
  //       throw new Error("Failed to download the file");
  //     }

  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = "LearnTemplate.py";
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //   } catch (error) {
  //     console.error("Error downloading the file:", error);
  //   }
  // };
  const handleButtonClick = (action) => {
    console.log(`${action} button clicked`);
    if(action ==="Train Model"){
      navigate("/train-page")
    }
    else if(action === "Download Template"){
      // handleDownload()
      fakehandleDownload()
    }
    
    

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
          onClick={() => handleButtonClick('View Models')}
          style={styles.button}
        >
          View Models
        </button>
        <button
          onClick={() => handleButtonClick('Download Template')}
          style={styles.button}
        >
          Download Template
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
