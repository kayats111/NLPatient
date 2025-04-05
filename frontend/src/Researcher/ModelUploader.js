import React, { useState } from "react";
import axios from "axios";
import DrawerMenu from '../DrawerMenu'; 
import { useRoleLinks } from "../context/FetchContext";
import "./ModelUploader.css";  // Import the CSS file

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
    <div className="container">
      <DrawerMenu links={links} />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="dropArea"
      >
        <h2>Upload Python Model</h2>
        <p>Drag and drop a Python file here</p>
        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
      </div>

      <div className="buttonContainer">
        <button className="button" onClick={uploadFile}>
          Upload File
        </button>
        <button className="button" onClick={addHyperParameter}>
          Add Hyper Parameters
        </button>
      </div>

      {isModalOpen && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h3>Add Hyper Parameters</h3>
            <div className="gridContainer">
              {hyperParams.map((param, index) => (
                <div key={index} className="inputField">
                  <input
                    type="text"
                    value={param}
                    onChange={(e) => handleHyperParamChange(index, e.target.value)}
                    placeholder={`Hyperparameter ${index + 1}`}
                  />
                  <button
                    className="removeButton"
                    onClick={() => removeHyperParam(index)}
                  >
                    -
                  </button>
                </div>
              ))}
            </div>
            <div className="buttonContainer">
              <button
                className="button"
                onClick={() => setHyperParams([...hyperParams, ""])}
              >
                Add Another Hyperparameter
              </button>
              <button className="button" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="modelLabel">Model Type</label>
        <select
          className="dropdown"
          value={modelType}
          onChange={(e) => setModelType(e.target.value)}
        >
          <option value="Scikit">Scikit</option>
          <option value="PyTorch">PyTorch</option>
        </select>
      </div>

      {uploadProgress && <div className="progress">{uploadProgress}</div>}
    </div>
  );
}

export default ModelUploader;
