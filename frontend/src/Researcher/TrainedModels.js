import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TrainedModels.css';
import DrawerMenu from '../DrawerMenu';
import { useRoleLinks } from "../context/FetchContext";
import { useRole } from '../context/roleContext';

const TrainedModels = () => {
  const [modelNames, setModelNames] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modelMetadata, setModelMetadata] = useState(null);
  const navigate = useNavigate();
  const { links } = useRoleLinks();
  const { role } = useRole();

  useEffect(() => {
    const fetchModelNames = async () => {
      try {
        const response = await axios.get('/predictors/api/predictors/names');
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
      // const response = await axios.get('/predictors/api/predictors/meta_data', {
      //   params: { "model name": selectedModel }
      // });
      const response = await axios.post('/predictors/api/predictors/meta_data',{
        "model name": selectedModel
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
      const response = await axios.delete('/predictors/api/predictors/delete', {
        data: { "model name": selectedModel }
      });

      if (response.data.error) {
        setError(response.data.message);
      } else {
        setModelNames(modelNames.filter((modelName) => modelName !== selectedModel));
        setSelectedModel(null); 
        setError('Model deleted successfully');
      }
    } catch (err) {
      setError('Failed to delete the model');
    }
  };

  const handleDownloadClick = async () => {
    if (!selectedModel) {
      setError('Please select a model');
      return;
    }

    try {
      const response = await axios.post(
        '/predictors/api/predictors/get_predictor',
        { "model name": selectedModel }, // POST data goes in the body
        { responseType: 'blob' } // Set response type to blob for file downloads
      );
      const disposition = response.headers['content-disposition']
      const filename = disposition.split('filename=')[1].replace(/"/g, '').trim();
      console.log(filename)     
      // if (contentDisposition) {
      //   const match = contentDisposition.match(/filename="?([^"]+)"?/);
      //   if (match && match[1]) {
      //     filename = match[1]; // Use the filename provided by the server
      //   }
      // }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}`); // Use the extracted filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      setError('Failed to download the model');
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setModelMetadata(null);
  };

  const handlePredictClick = async () => {
    if (!selectedModel) {
      setError("Please select a model.");
      return;
    }

    try {
      const response = await axios.post('/predictors/api/predictors/meta_data',{
        "model name": selectedModel
      });

      if (response.data.error) {
        setError(response.data.message);
      } else {
        const metadata = response.data.value;

        navigate("/doctor-predict", {
          state: { modelName: selectedModel, modelMetadata: metadata.fields, labels: metadata.labels }
        });
      }
    } catch (err) {
      setError('Failed to fetch model metadata for prediction');
    }
  };

  return (
    <div className="trainedCont">
      <h1>Trained Models</h1>
      <DrawerMenu links={links} />
      {error && <div className="error">{error}</div>}

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

      <div className="action-buttons">
        {role !== 'doctor' && (
          <>
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
          </>
        )}
        <button
          className={`action-button predict-button ${selectedModel ? 'enabled' : 'disabled'}`}
          onClick={handlePredictClick}
          disabled={!selectedModel}
        >
          Predict
        </button>
        {role !== 'doctor' && (
          <button
            className={`action-button download-button ${selectedModel ? 'enabled' : 'disabled'}`}
            onClick={handleDownloadClick}
            disabled={!selectedModel}
          >
            Download
          </button>
        )}
      </div>

      {selectedModel && (
        <div className="selection-message">
          <p>You have selected: {selectedModel}</p>
        </div>
      )}

      {modalVisible && (
        <div className="overlay">
          <div className="modal-content">
            <h2>Model Metadata</h2>
            <div className="metadata-table">
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {modelMetadata && Object.entries(modelMetadata).map(([key, value]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>{JSON.stringify(value, null, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
