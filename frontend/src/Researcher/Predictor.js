import React, { useState, useEffect } from "react";
import { useLocation} from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import './Predictor.css'; // Importing the new CSS file
import axios from "axios";
import DrawerMenu from '../DrawerMenu';
import { useRoleLinks } from "../context/FetchContext";

const Predictor = () => {
  const location = useLocation();
  const { links } = useRoleLinks();
  const { modelName, modelMetadata, labels } = location.state || {};
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (modelMetadata) {
      const initialInputs = modelMetadata.reduce((acc, field) => {
        acc[field] = ""; 
        return acc;
      }, {});
      setInputs(initialInputs);
    }
  }, [modelMetadata]);

  const handleInputChange = (field, value) => {
    setInputs(prevInputs => ({
      ...prevInputs,
      [field]: value,
    }));
  };

  const handlePredict = async () => {
    const inputList = modelMetadata.map(field => inputs[field]);
    setLoading(true);
    setError(""); 
    try {
      const response = await axios.post(
        "http://localhost:3002/api/predictors/predict", 
        {
          "model name": modelName,  
          "sample": inputList.map((x) => Number(x)),        
        },
        {
          headers: {
            "Content-Type": "application/json",  
          },
        }
      );

      if (response.status === 200) {
        setPrediction(response.data.value);
      } else {
        setError(response.data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  const closeModalOnOutsideClick = (event) => {
    if (event.target.classList.contains('modal-overlay')) {
      setPrediction(null);
    }
  };
  const handleModalClose=()=>{
    setPrediction(null);
    navigate('/train-page')
  }

  useEffect(() => {
    if (prediction) {
      document.addEventListener('click', closeModalOnOutsideClick);

      return () => {
        document.removeEventListener('click', closeModalOnOutsideClick);
      };
    }
  }, [prediction]);

  const isPredictButtonDisabled = Object.values(inputs).some(input => input === "");

  if (!modelName || !modelMetadata) {
    return <p>Error: No model selected or metadata available.</p>;
  }

  return (
    <div className="predictor-container">
      <DrawerMenu links={links} />
      <h1 className="heading">Predict for {modelName}</h1>
      <div className="input-container">
        {modelMetadata.map((field, index) => (
          <div key={index} className="input-item">
            <label htmlFor={field} className="label">{field}</label>
            <input
              id={field}
              type="text"
              className="input"
              value={inputs[field] || ""}
              onChange={(e) => handleInputChange(field, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="predict-button-container">
        <button
          className="predict-button"
          onClick={handlePredict}
          disabled={isPredictButtonDisabled}
        >
          {loading ? "Loading..." : "Predict"}
        </button>
      </div>

      {prediction && (
        <div className="predictor-modal-overlay">
          <div className="predictor-modal-content">
            <h2>Prediction Result</h2>
            <div className="predictor-metadata-table">
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Prediction</th>
                  </tr>
                </thead>
                <tbody>
                  {labels.map((field, index) => (
                    <tr key={index}>
                      <th>{field}</th>
                      <td>{prediction[index] || "No result"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="close-modal" onClick={() => handleModalClose()}>Close</button>
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
