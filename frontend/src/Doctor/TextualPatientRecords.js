import React, { useEffect, useState, useContext, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import './TextualPatientRecords.css';
import URLContext from '../context/URLContext';
import DrawerMenu from '../DrawerMenu';
import { useRoleLinks } from '../context/FetchContext';

const TextualPatientRecords = () => {
  // Records state
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Edit modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState({});

  // Predict modal state
  const [showPredictModal, setShowPredictModal] = useState(false);
  const [modelNames, setModelNames] = useState([]);
  const [predictError, setPredictError] = useState("");

  // Contexts and refs
  const { links } = useRoleLinks();
  const url = useContext(URLContext).DataManager;
  const predictorsUrl = useContext(URLContext).Predictors;
  const editModalRef = useRef();
  const predictModalRef = useRef();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 10;

  // Fetch all records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`${url}/api/data/text/read/records/all`);
        setRecords(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch records.');
      }
    };
    fetchRecords();
  }, [url]);

  // Fetch model names when predict modal opens
  useEffect(() => {
    if (!showPredictModal) return;
    const fetchModelNames = async () => {
      try {
        const response = await axios.get(`${predictorsUrl}/api/predictors/names`);
        const data = response.data;
        if (data.error) {
          setPredictError(data.message || 'Failed to load models.');
          setModelNames([]);
        } else {
          setPredictError("");
          const bertOnly = []
          for (const name of data.value){
            try{
              const meta = await fetchModelMetadata(name);
              if(meta["model type"] === "BERT"){
                bertOnly.push(name);
              }
            }catch{
              //ignore fetching metadata errors here.
              }
          }
          setModelNames(bertOnly || []);
        }
      } catch (err) {
        console.error(err);
        setPredictError('Failed to fetch model names.');
        setModelNames([]);
      }
    };
    fetchModelNames();
  }, [showPredictModal, predictorsUrl]);

  // Helper: fetch metadata for a given model
  const fetchModelMetadata = async (modelName) => {
    try {
      const response = await axios.post(
        `${predictorsUrl}/api/predictors/meta_data`,
        { 'model name': modelName }
      );
      const data = response.data;
      if (data.error) {
        throw new Error(data.message);
      }
      return data.value;
    } catch (err) {
      console.error('Error fetching model metadata:', err);
      throw err;
    }
  };

  // Close edit modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        modalVisible &&
        editModalRef.current &&
        !editModalRef.current.contains(e.target)
      ) {
        setModalVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modalVisible]);

  // Close predict modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showPredictModal &&
        predictModalRef.current &&
        !predictModalRef.current.contains(e.target)
      ) {
        setShowPredictModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPredictModal]);

  // Pagination logic
  const startIndex = currentPage * recordsPerPage;
  const currentRecords = records.slice(startIndex, startIndex + recordsPerPage);

  const handlePrevious = () => setCurrentPage((p) => Math.max(p - 1, 0));
  const handleNext = () =>
    setCurrentPage((p) =>
      p < Math.ceil(records.length / recordsPerPage) - 1 ? p + 1 : p
    );

  const truncateText = (text, maxLength = 60) =>
    text && text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

  // Delete record
  const handleDelete = async () => {
    if (!selectedRecord?.id) return;
    try {
      await axios.delete(`${url}/api/data/text/delete/${selectedRecord.id}`);
      setRecords((prev) => prev.filter((r) => r.id !== selectedRecord.id));
      setSelectedRecord(null);
    } catch (err) {
      console.error(err);
      setError('Delete failed.');
    }
  };

  // Open edit modal
  const handleOpenModal = () => {
    if (!selectedRecord) return;
    setEditData({ ...selectedRecord });
    setModalVisible(true);
  };

  // Update record
  const handleUpdate = async () => {
    try {
      await axios.patch(`${url}/api/data/text/update`, editData);
      setRecords((prev) =>
        prev.map((r) => (r.id === editData.id ? { ...editData } : r))
      );
      setModalVisible(false);
      setSelectedRecord(null);
    } catch (err) {
      console.error(err);
      setError('Update failed.');
    }
  };

  // Open predict modal
  const openPredictModal = () => {
    if (!selectedRecord) {
      setPredictError('No record selected for prediction.');
      return;
    }
    setPredictError('');
    setShowPredictModal(true);
  };

  // Choose model & fetch metadata using helper
  const handlePredictModel = async (modelName) => {
    try {
      const metadata = await fetchModelMetadata(modelName);
      const record = records.find((r) => r.id === selectedRecord.id);
      if (!record) {
        setPredictError('Selected record not found.');
        return;
      }
      // console.log(record.text)
      const sample = [record.text]
      // console.log(record)
      // console.log('Sample ready for prediction:', sample);
      const payload = {
        modelName,
        modelMetadata: metadata.fields,
        labels:       metadata.labels,
        model_type:   metadata["model type"],
        sample,
        returnLoc: "/view-textual-records"
      };

      // 2. Log it so you can see the full object
      // console.log("Navigating to doctor-predict with:", payload);

      // 3. Then navigate
      navigate("/doctor-predict", { state: payload });
      setShowPredictModal(false);
    } catch (err) {
      setPredictError(err.message || 'Failed to fetch model metadata.');
    }
  };

  return (
    <div className="textual-records-page">
      <DrawerMenu links={links} />
      <h1>Textual Patient Records</h1>
      {error && <p className="error">{error}</p>}

      <table className="records-table">
        <thead>
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>Text</th>
            <th>Affective</th>
            <th>Any</th>
            <th>Bipolar</th>
            <th>Schizophrenia Spectr</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((record, index) => (
            <tr
              key={record.id}
              className={selectedRecord?.id === record.id ? 'selected' : ''}
              onClick={() => setSelectedRecord(record)}
            >
              <td>{startIndex + index + 1}</td>
              <td>{record.id}</td>
              <td>{truncateText(record.text)}</td>
              <td>{record.affective}</td>
              <td>{record.any}</td>
              <td>{record.bipolar}</td>
              <td>{record.schizophreniaSpectr}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="action-buttons">
        <button onClick={handleDelete} disabled={!selectedRecord}>
          Delete
        </button>
        <button onClick={handleOpenModal} disabled={!selectedRecord}>
          View / Update
        </button>
        <button onClick={openPredictModal} disabled={!selectedRecord}>
          Predict
        </button>
        <button onClick={handlePrevious} disabled={currentPage === 0}>
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={startIndex + recordsPerPage >= records.length}
        >
          Next
        </button>
      </div>

      {/* Edit Modal Overlay */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content" ref={editModalRef}>
            <h2>Edit Record</h2>
            <div className="inputs-field">
              <label>Text</label>
              <textarea
                value={editData.text}
                onChange={(e) => setEditData({ ...editData, text: e.target.value })}
              />
            </div>
            <div className="input-field">
              <label>Affective</label>
              <input
                type="text"
                value={editData.affective}
                onChange={(e) => setEditData({ ...editData, affective: e.target.value })}
              />
            </div>
            <div className="input-field">
              <label>Any</label>
              <input
                type="text"
                value={editData.any}
                onChange={(e) => setEditData({ ...editData, any: e.target.value })}
              />
            </div>
            <div className="input-field">
              <label>Bipolar</label>
              <input
                type="text"
                value={editData.bipolar}
                onChange={(e) => setEditData({ ...editData, bipolar: e.target.value })}
              />
            </div>
            <div className="input-field">
              <label>Schizophrenia Spectr</label>
              <input
                type="text"
                value={editData.schizophreniaSpectr}
                onChange={(e) => setEditData({ ...editData, schizophreniaSpectr: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="save-button" onClick={handleUpdate}>
                Save
              </button>
              <button className="close-modal" onClick={() => setModalVisible(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Predict Modal Overlay */}
      {showPredictModal && (
        <div className="modal-overlay">
          <div className="predict-modal-content" ref={predictModalRef}>
            <h2>Select a Model to Predict</h2>
            {predictError ? (
              <p className="error-message">{predictError}</p>
            ) : (
              <div className="model-list">
                {modelNames.map((name) => (
                  <button
                    key={name}
                    className="model-button"
                    onClick={() => handlePredictModel(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
            <button className="close-modal" onClick={() => setShowPredictModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextualPatientRecords;