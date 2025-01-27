import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const TrainedModels = () => {
  const [modelNames, setModelNames] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modelMetadata, setModelMetadata] = useState(null);
  const navigate = useNavigate();

  // Fetch the model names
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

  const handleMetaDataClick = async () => {
    if (!selectedModel) {
      setError('Please select a model');
      return;
    }

    try {
      const response = await axios.get('http://localhost:3002/api/predictors/meta_data', {
        params: { "model name": selectedModel }
      });

      if (response.data.error) {
        setError(response.data.message);
      } else {
        setModelMetadata(response.data.value);
        setModalVisible(true);
      }
    } catch (err) {
      setError('Failed to fetch model metadata');
    }
  };

  const handleDeleteClick = async () => {
    if (!selectedModel) {
      setError('Please select a model');
      return;
    }

    try {
      const response = await axios.delete('http://localhost:3002/api/predictors/delete', {
        data: { "model name": selectedModel }
      });

      if (response.data.error) {
        setError(response.data.message);
      } else {
        setModelNames(modelNames.filter((modelName) => modelName !== selectedModel));
        setSelectedModel(null); // Deselect the model after deletion
        setError('Model deleted successfully');
      }
    } catch (err) {
      setError('Failed to delete the model');
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setModelMetadata(null);
  };

  const handlePredictClick = () => {
    alert('Predict button has been pressed');
  };

  return (
    <div className="container">
      <h1>Trained Models</h1>

      {/* Error message */}
      {error && <div className="error">{error}</div>}

      {/* Model list with clickable buttons */}
      <div className="model-list">
        {modelNames.map((modelName) => (
          <button
            key={modelName}
            className={`list-item ${modelName === selectedModel ? 'active' : ''}`}
            onClick={() => handleModelClick(modelName)}
          >
            {modelName}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="action-buttons">
        <button
          className={`action-button ${selectedModel ? 'enabled' : 'disabled'}`}
          onClick={handleMetaDataClick}
          disabled={!selectedModel}
        >
          MetaData
        </button>
        <button
          className={`action-button delete-button ${selectedModel ? 'enabled' : 'disabled'}`}
          onClick={handleDeleteClick}
          disabled={!selectedModel}
        >
          Delete
        </button>
        <button
          className={`action-button predict-button ${selectedModel ? 'enabled' : 'disabled'}`}
          onClick={handlePredictClick}
          disabled={!selectedModel}
        >
          Predict
        </button>
      </div>

      {/* Selection message */}
      {selectedModel && (
        <div className="selection-message">
          <p>You have selected: {selectedModel}</p>
        </div>
      )}

      {/* Modal Overlay for Metadata */}
      {modalVisible && (
        <div className="overlay">
          <div className="modal-content">
            <h2>Model Metadata</h2>
            <div className="metadata">
              {modelMetadata && Object.entries(modelMetadata).map(([key, value]) => (
                <div key={key} className="metadata-item">
                  <strong>{key}:</strong> {JSON.stringify(value, null, 2)}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="close-modal" onClick={handleModalClose}>
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainedModels;
