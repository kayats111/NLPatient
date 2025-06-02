import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DrawerMenu from '../DrawerMenu'; 
import { useRoleLinks } from "../context/FetchContext";
import URLContext from '../context/URLContext';
import './ResearcherMain.css'; 

function ResearcherMain() {
  const navigate = useNavigate();
  const { links } = useRoleLinks();
  const url = useContext(URLContext).ModelTrainer;

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(url + "/api/model_trainer/template");
      if (!response.ok) {
        throw new Error("Failed to download the model‐trainer template");
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "LearnTemplate.py";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const handleDownloadNlpTemplate = async () => {
    try {
      const response = await fetch(url + "/api/model_trainer/text/template");
      if (!response.ok) {
        throw new Error("Failed to download the NLP template");
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "NlpTemplate.py";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the NLP template:", error);
    }
  };

  const handleButtonClick = (action) => {
    if (action === "Train Model") {
      navigate("/train-page");
    } else if (action === "Download Template") {
      handleDownloadTemplate();
    } else if (action === "Download NLP Template") {
      handleDownloadNlpTemplate();
    } else if (action === 'Add Model') {
      navigate("/model_uploader");
    } else if (action === 'View Models') {
      navigate("/model-viewer");
    } else if (action === 'View Records') {
      navigate("/records-viewer");
    } else if (action === "View Textual Patient Records") {
      navigate('/view-textual-records');
    }
  };

  return (
    <div style={styles.container}>
      <DrawerMenu links={links} />
      <h2>Welcome to the Researcher Hub</h2>
      <p>You are now logged in.</p>

      <div style={styles.buttonContainer}>
        <button
          className="my-button"
          onClick={() => handleButtonClick('Add Model')}
        >
          Add Model
        </button>
        <button
          className="my-button"
          onClick={() => handleButtonClick('View Models')}
        >
          View Models
        </button>
        <button
          className="my-button"
          onClick={() => handleButtonClick('Download Template')}
        >
          Download Template
        </button>
        <button
          className="my-button"
          onClick={() => handleButtonClick('Download NLP Template')}
        >
          Download NLP Template
        </button>
        <button
          className="my-button"
          onClick={() => handleButtonClick('Train Model')}
        >
          Trained Models
        </button>
        <button
          className="my-button"
          onClick={() => handleButtonClick('View Records')}
        >
          View Medical Records
        </button>
        <button
          className="my-button"
          onClick={() => handleButtonClick('View Textual Patient Records')}
        >
          View Textual Medical Records
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
  }
};

export default ResearcherMain;
