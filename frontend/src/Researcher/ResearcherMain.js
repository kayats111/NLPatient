import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import DoctorDrawerMenu from '../Doctor/DoctorDrawerMenu'; 
import { useResearcherLinks } from '../Context';


function ResearcherMain() {
  const navigate = useNavigate(); // Use the hook for navigation
  const {links} = useResearcherLinks();
  const updatedLinks = [...links,{name:"Role Page", path:"/choicepage"}]
  const fakehandleDownload = () => {
    alert('fake handle download');
  };
  const handleDownload = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/model_trainer/template");
      if (!response.ok) {
        throw new Error("Failed to download the file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "LearnTemplate.py";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };
  const handleButtonClick = (action) => {
    console.log(`${action} button clicked`);
    if(action ==="Train Model"){
      navigate("/train-page")
    }
    else if(action === "Download Template"){
      handleDownload()
      // fakehandleDownload()
    }
    else if(action === 'Add Model'){
      navigate("/model_uploader")
    }
    else if(action === 'View Models'){
      navigate("/model-viewer")
    }
    else if(action === 'View Records'){
      navigate("/records-viewer")
    }
    
    

  };

  return (
    <div style={styles.container}>
      <DoctorDrawerMenu links = {updatedLinks} />
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
          Trained Models
        </button>
        <button
          onClick={() => handleButtonClick('View Records')}
          style={styles.button}
        >
          View Medical Records
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
