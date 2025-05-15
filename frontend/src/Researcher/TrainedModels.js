import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TrainedModels.css';
import DrawerMenu from '../DrawerMenu';
import { useRoleLinks } from "../context/FetchContext";
import { useRole } from '../context/roleContext';
import URLContext from '../context/URLContext';

const TrainedModels = () => {
  const [modelNames, setModelNames] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modelMetadata, setModelMetadata] = useState(null);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [secondModel, setSecondModel] = useState(null);
  const [secondModelMetadata, setSecondModelMetadata] = useState(null);

  const navigate = useNavigate();
  const { links } = useRoleLinks();
  const { role } = useRole();
  const url = useContext(URLContext).Predictors;

  useEffect(() => {
    const fetchModelNames = async () => {
      try {
        const response = await axios.get(url + '/api/predictors/names');
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
      const response = await axios.post(url + '/api/predictors/meta_data', {
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
      const response = await axios.delete(url + '/api/predictors/delete', {
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
        url + '/api/predictors/get_predictor',
        { "model name": selectedModel },
        { responseType: 'blob' }
      );
      const disposition = response.headers['content-disposition'];
      const filename = disposition.split('filename=')[1].replace(/"/g, '').trim();

      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
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
    setCompareModalVisible(false);
    setSecondModel(null);
    setSecondModelMetadata(null);
  };

  const handleCompareModels = () => {
    setCompareModalVisible(true);
  };

  const handlePredictClick = async () => {
    if (!selectedModel) {
      setError("Please select a model.");
      return;
    }

    try {
      const response = await axios.post(url + '/api/predictors/meta_data', {
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

  const handleSecondModelSelect = async (modelName) => {
    setSecondModel(modelName);
    try {
      const response = await axios.post(url + '/api/predictors/meta_data', {
        "model name": modelName
      });
      if (response.data.error) {
        setError(response.data.message);
      } else {
        setSecondModelMetadata(response.data.value);
      }
    } catch (err) {
      setError('Failed to fetch second model metadata');
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
            className={`tlist-item ${modelName === selectedModel ? 'active' : ''}`}
            onClick={() => handleModelClick(modelName)}
          >
            {modelName}
          </button>
        ))}
      </div>

      <div className="taction-buttons">
        {role !== 'Doctor' && (
          <>
            <button
              className={`taction-button ${selectedModel ? 'enabled' : 'disabled'}`}
              onClick={handleMetaDataClick}
              disabled={!selectedModel}
            >
              MetaData
            </button>
            <button
              className={`taction-button delete-button ${selectedModel ? 'enabled' : 'disabled'}`}
              onClick={handleDeleteClick}
              disabled={!selectedModel}
            >
              Delete
            </button>
          </>
        )}
        <button
          className={`taction-button tpredict-button ${selectedModel ? 'enabled' : 'disabled'}`}
          onClick={handlePredictClick}
          disabled={!selectedModel}
        >
          Predict
        </button>
        {role !== 'doctor' && (
          <button
            className={`taction-button download-button ${selectedModel ? 'enabled' : 'disabled'}`}
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

      {(modalVisible || compareModalVisible) && (
        <div className="overlay">
          {modalVisible && (
            <div className="modal-content main-modal">
              <h2>{selectedModel} Metadata</h2>
              <div className="metadata-table">
                <table>
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelMetadata &&
                      Object.entries(modelMetadata).map(([key, value]) => (
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
                <button className="close-modal" onClick={handleCompareModels}>
                  Compare
                </button>
              </div>
            </div>
          )}

          {compareModalVisible && (
            <div className="modals-content compare-modal">
              <h2>Compare With Another Model</h2>
              <div className="model-list">
                {modelNames
                  .filter((name) => name !== selectedModel)
                  .map((name) => (
                    <button
                      key={name}
                      className={`tlist-item ${secondModel === name ? 'active' : ''}`}
                      onClick={() => handleSecondModelSelect(name)}
                    >
                      {name}
                    </button>
                  ))}
              </div>
              {secondModelMetadata && (
                <div className="metadata-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(secondModelMetadata).map(([key, value]) => (
                        <tr key={key}>
                          <th>{key}</th>
                          <td>{JSON.stringify(value, null, 2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* <div className="modal-actions">
                <button className="close-modal" onClick={() => setCompareModalVisible(false)}>
                  Close Compare
                </button>
              </div> */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainedModels;
