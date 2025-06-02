import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import './TextualPatientRecords.css';
import URLContext from '../context/URLContext';
import DrawerMenu from '../DrawerMenu';
import { useRoleLinks } from "../context/FetchContext";

const TextualPatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState({});
  const { links } = useRoleLinks();
  const url = useContext(URLContext).DataManager;
  const modalRef = useRef();

  // ─────────────── Pagination State ───────────────
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 10;

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

  // Compute indexes and slice
  const startIndex = currentPage * recordsPerPage;
  const currentRecords = records.slice(startIndex, startIndex + recordsPerPage);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentPage((prev) =>
      prev < Math.ceil(records.length / recordsPerPage) - 1 ? prev + 1 : prev
    );
  };

  const truncateText = (text, maxLength = 60) =>
    text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

  const handleDelete = async () => {
    if (!selectedRecord?.id) return;
    try {
      await axios.delete(`${url}/api/data/text/delete/${selectedRecord.id}`);
      setRecords((prev) => prev.filter((r) => r.id !== selectedRecord.id));
      setSelectedRecord(null);
    } catch (err) {
      console.error('Failed to delete record:', err);
      setError('Delete failed.');
    }
  };

  const handleOpenModal = () => {
    if (!selectedRecord) return;
    setEditData({ ...selectedRecord });
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(`${url}/api/data/text/update`, editData);
      setRecords((prev) =>
        prev.map((r) => (r.id === editData.id ? { ...editData } : r))
      );
      setModalVisible(false);
      setSelectedRecord(null);
    } catch (err) {
      console.error('Failed to update record:', err);
      setError('Update failed.');
    }
  };

  // Close modal on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        modalVisible &&
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        setModalVisible(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [modalVisible]);

  return (
    <div className="textual-records-page">
      <DrawerMenu links={links} />
      <h1>Textual Patient Records</h1>
      {error && <p className="error">{error}</p>}

      <table className="records-table">
        <thead>
          <tr>
            <th>#</th>
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
              <td>{truncateText(record.text)}</td>
              <td>{record.affective}</td>
              <td>{record.any}</td>
              <td>{record.bipolar}</td>
              <td>{record.schizophreniaSpectr}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Buttons */}
      <div className="pagination-buttons">
        
      </div>

      <div className="action-buttons">
        <button onClick={handleDelete} disabled={!selectedRecord}>
          Delete
        </button>
        <button onClick={handleOpenModal} disabled={!selectedRecord}>
          View / Update
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

      {modalVisible && (
        <div className="modal">
          <div className="modal-content" ref={modalRef}>
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
                onChange={(e) =>
                  setEditData({ ...editData, schizophreniaSpectr: e.target.value })
                }
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
    </div>
  );
};

export default TextualPatientRecords;
