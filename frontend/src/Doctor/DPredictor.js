import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "./DPredictor.css"; // Import the CSS file

const DPredictor = () => {
  const [modelNames, setModelNames] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModelNames = async () => {
      try {
        const response = await axios.get('http://localhost:3002/api/predictors/names');
        const data = response.data;
        if (data.error) {
          setError(data.message);
        } else {
          setModelNames(data.value);
        }
      } catch (err) {
        setError('Failed to fetch model names');
      }
    };

    fetchModelNames();
  }, []);

  const handleModelClick = (modelName) => {
    setSelectedModel(modelName);
  };

  const handlePredictClick = async () => {
    if (!selectedModel) {
      setError("Please select a model.");
      return;
    }

    try {
      const response = await axios.get('http://localhost:3002/api/predictors/meta_data', {
        params: { "model name": selectedModel }
      });

      if (response.data.error) {
        setError(response.data.message);
      } else {
        const metadata = response.data.value;

        // Pass the model name and metadata to the Predict page using navigate state
        // console.log(metadata.fields);
        navigate("/doctor-predict", {
          state: { modelName: selectedModel, modelMetadata: metadata.fields }
        });
      }
    } catch (err) {
      setError('Failed to fetch model metadata for prediction');
    }
  };

  return (
    <div className="container">
      <h1>Trained Models</h1>

      {error && <div className="error">{error}</div>}

      <div className="model-list">
        {modelNames.map((modelName) => (
          <button
            key={modelName}
            className={`list-item ${modelName === selectedModel ? 'active' : ''}`}
            onClick={() => {
              handleModelClick(modelName);
            }}
          >
            {modelName}
          </button>
        ))}
      </div>

      <div className="action-buttons">
        <button
          className={`action-button predict-button ${selectedModel ? 'enabled' : 'disabled'}`}
          onClick={handlePredictClick}
          disabled={!selectedModel}
        >
          Predict
        </button>
      </div>

      {selectedModel && (
        <div className="selection-message">
          <p>You have selected: {selectedModel}</p>
        </div>
      )}
    </div>
  );
};

export default DPredictor;
