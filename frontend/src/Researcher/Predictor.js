import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // to read the passed state
import './Predictor.css'; // Importing the new CSS file
import axios from "axios";
import DrawerMenu from '../DrawerMenu'; 
import { useRoleLinks } from "../context/FetchContext";


const Predictor = () => {
  const location = useLocation();
  const { links } = useRoleLinks();
  const { modelName, modelMetadata,labels } = location.state || {}; // Destructure state passed from TrainedModels

  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (modelMetadata) {
      // Initialize inputs with an empty string for each modelMetadata field
      const initialInputs = modelMetadata.reduce((acc, field) => {
        acc[field] = ""; // Set empty string as initial value for each field
        return acc;
      }, {});
      setInputs(initialInputs);
    }
  }, [modelMetadata]);

  const handleInputChange = (field, value) => {
    setInputs(prevInputs => ({
      ...prevInputs,
      [field]: value, // Update value for specific field
    }));
  };

  const handlePredict = async () => {
    const inputList = modelMetadata.map(field => inputs[field]); // Map inputs to the correct order of modelMetadata
    // console.log("metadata",modelMetadata)
    setLoading(true);
    setError(""); // Reset any previous error
    try {
      const response = await axios.post(
        "http://localhost:3002/api/predictors/predict",  // Use POST method for prediction
        {
          "model name": modelName,  // Ensure the model name is passed
          "sample": inputList.map((x) => Number(x)),        // Pass the sample data
        },
        {
          headers: {
            "Content-Type": "application/json",  // Ensure the request content type is application/json
          },
        }
      );
  
      // console.log(response.data)
      if (response.status === 200) {
        // console.log(response.data)
        setPrediction(response.data.value); // Assuming 'value' contains the prediction result
      } else {
        setError(response.data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  if (!modelName || !modelMetadata) {
    return <p>Error: No model selected or metadata available.</p>;
  }

  return (
    <div className="container">
      <DrawerMenu links={links} />
      <h1 className="heading">Predict for {modelName}</h1>
      <div className="input-container">
        {modelMetadata.map((field, index) => (
          <div key={index} className="input-item">
            <label className="label">{field}</label>
            <input
              type="text"
              className="input"
              value={inputs[field] || ""}
              onChange={(e) => handleInputChange(field, e.target.value)}
            />
            <span className="field-value">{inputs[field]}</span>
          </div>
        ))}
      </div>

      <div className="predict-button-container">
        <button
          className="predict-button"
          onClick={handlePredict}
          disabled={Object.values(inputs).some(input => input === "")}
        >
          {loading ? "Loading..." : "Predict"}
        </button>
      </div>

      {prediction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Prediction Result</h2>
            <ul>
              {labels.map((field, index) => (
                <li key={index}>
                  <strong>{field}:</strong> {prediction[index] || "No result"}
                </li>
              ))}
            </ul>
            <button className="close-modal" onClick={() => setPrediction(null)}>Close</button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Predictor;
