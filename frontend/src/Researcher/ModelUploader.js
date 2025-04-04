import React, { useState } from "react";
import axios from "axios";
import DrawerMenu from '../DrawerMenu'; 
import { useRoleLinks } from "../context/FetchContext";

function ModelUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const { links } = useRoleLinks();

  const [hyperParams, setHyperParams] = useState([]);
  const [modelType, setModelType] = useState("Scikit");

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

  // Handle file drop
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === "text/x-python") {
      setSelectedFile(file);
    } else {
      alert("Please upload a valid Python (.py) file.");
    }
  };

  // Handle file drag over
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Handle file upload using FormData
  const uploadFile = async () => {
    if (!selectedFile) {
      alert("No file selected. Please upload a Python file.");
      return;
    }

    const formData = new FormData();
    formData.append("model file", selectedFile);

    try {
      setUploadProgress("Uploading...");
      // console.log(selectedFile)
      await axios.post("http://localhost:3001/api/model_trainer/add/model", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(`Upload progress: ${percentage}%`);
        },
      });
      await axios.post("http://localhost:3001/api/model_trainer/add/parameters", {
        "modelName": selectedFile.name,
        "hyperParameters": hyperParams,
        "modelType": modelType,
      });

      setUploadProgress("Upload successful!");
    } catch (error) {
      console.error("File upload failed:", error);
      setUploadProgress("Upload failed. Please try again.");
    }
  };

  // Handle Hyper Parameters modal
  const addHyperParameter = () => {
    setIsModalOpen(true); // Open the modal
  };

  const handleHyperParamChange = (index, value) => {
    const updatedParams = [...hyperParams];
    updatedParams[index] = value;
    setHyperParams(updatedParams);
  };

  const removeHyperParam = (index) => {
    const updatedParams = hyperParams.filter((_, i) => i !== index);
    setHyperParams(updatedParams);
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div style={styles.container}>
      <DrawerMenu links={links} />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={styles.dropArea}
      >
        <h2>Upload Python Model</h2>
        <p>Drag and drop a Python file here</p>
        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
      </div>

      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={uploadFile}>
          Upload File
        </button>
        <button style={styles.button} onClick={addHyperParameter}>
          Add Hyper Parameters
        </button>
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Add Hyper Parameters</h3>
            <div style={styles.gridContainer}>
              {hyperParams.map((param, index) => (
                <div key={index} style={styles.inputField}>
                  <input
                    type="text"
                    value={param}
                    onChange={(e) => handleHyperParamChange(index, e.target.value)}
                    placeholder={`Hyperparameter ${index + 1}`}
                  />
                  <button
                    style={styles.removeButton}
                    onClick={() => removeHyperParam(index)}
                  >
                    -
                  </button>
                </div>
              ))}
            </div>
            <div style={styles.buttonContainer}>
              <button
                style={styles.button}
                onClick={() => setHyperParams([...hyperParams, ""])}
              >
                Add Another Hyperparameter
              </button>
              <button style={styles.button} onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <label style={styles.modelLabel}>Model Type</label>
        <select
          style={styles.dropdown}
          value={modelType}
          onChange={(e) => setModelType(e.target.value)}
        >
          <option value="Scikit">Scikit</option>
          <option value="PyTorch">PyTorch</option>
        </select>
      </div>

      {uploadProgress && <div style={styles.progress}>{uploadProgress}</div>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "20px",
  },
  dropArea: {
    width: "80%",
    margin: "50px auto",
    padding: "20px",
    border: "2px dashed #007BFF",
    borderRadius: "8px",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    color: "#333",
    cursor: "pointer",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  progress: {
    marginTop: "10px",
    color: "#007BFF",
    fontSize: "16px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "80%",
    maxWidth: "800px", // To limit the width of the modal
    textAlign: "center",
  },
  modalLabel: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  inputField: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", // Responsive grid layout
    gap: "10px",
    marginBottom: "20px",
  },
  modelLabel: {
    marginTop: "10px",
    fontSize: "16px",
  },
  dropdown: {
    padding: "8px",
    fontSize: "14px",
    marginTop: "5px",
  },
  removeButton: {
    marginLeft: "10px",
    padding: "5px 10px",
    fontSize: "16px",
    backgroundColor: "#FF4D4D",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ModelUploader;
