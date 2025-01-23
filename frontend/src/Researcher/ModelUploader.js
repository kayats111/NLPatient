import React, { useState } from "react";
import axios from "axios";

function ModelUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

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
      await axios.post("http://localhost:3001/api/model_trainer/add_model", formData, {
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
      setUploadProgress("Upload successful!");
    } catch (error) {
      console.error("File upload failed:", error);
      setUploadProgress("Upload failed. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={styles.dropArea}
      >
        <h2>Upload Python Model</h2>
        <p>Drag and drop a Python file here</p>
        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
      </div>
      <button style={styles.button} onClick={uploadFile}>
        Upload File
      </button>
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
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
  },
  progress: {
    marginTop: "10px",
    color: "#007BFF",
    fontSize: "16px",
  },
};

export default ModelUploader;
