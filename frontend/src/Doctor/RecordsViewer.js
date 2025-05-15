import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import DrawerMenu from '../DrawerMenu';
import { useRoleLinks } from "../context/FetchContext";
import { useRole } from "../context/roleContext";
import "./RecordsViewer.css";
import URLContext from '../context/URLContext';

const RecordsViewer = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 10;
  const { links } = useRoleLinks();
  const { role } = useRole();
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const tempUrl = useContext(URLContext).DataManager;
  const server_url = tempUrl + "/api/data";

  // Filter overlay state
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]); // Fields to show
  const [temporaryFields, setTemporaryFields] = useState(["codingNum", "id"]);
  const [allFields, setAllFields] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(server_url + "/read/records/all");
        if (!response.ok) throw new Error(`Failed to fetch records: ${response.status}`);
        const data = await response.json();

        setRecords(data);

        if (data.length > 0) {
          const all = Object.keys(data[0]);
          const userVisible = all.filter(k => k !== "id" && k !== "codingNum");
          setAllFields(all);
          setSelectedFields(["codingNum", ...userVisible]); // ✅ init fields to show
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchRecords();
  }, []);

  // Pagination
  const startIndex = currentPage * recordsPerPage;
  const currentRecords = records.slice(startIndex, startIndex + recordsPerPage);

  const handlePrevious = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNext = () => {
    setCurrentPage((prevPage) =>
      prevPage < Math.ceil(records.length / recordsPerPage) - 1 ? prevPage + 1 : prevPage
    );
  };

  const handleUpdate = (record) => {
    navigate("/update-medical-records", { state: { record } });
  };

  const handleDelete = async (record) => {
    const id = record.id;
    try {
      await fetch(server_url + `/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      alert(`Record ID: ${record.codingNum}, Deleted Successfully`);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handlePredict = (id) => {
    navigate("/doctor-predict");
  };

  // Filter Overlay
  const toggleFieldSelection = (field) => {
    if (field === "codingNum" || field === "id") return;
    setTemporaryFields((prev) =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleChooseAll = () => {
    setTemporaryFields(allFields);
  };

  const handleApplyFilter = () => {
    const guaranteedFields = ["id", "codingNum", ...temporaryFields.filter(f => f !== "id" && f !== "codingNum")];
    setSelectedFields(guaranteedFields);
    setOverlayVisible(false);
    setTemporaryFields(["codingNum", "id"]);
    setCurrentPage(0);
  };

  const handleExitOverlay = () => {
    setOverlayVisible(false);
  };

  return (
    <div>
      <DrawerMenu links={links} />
      <div className="center-container">
        <h1>Patient Records</h1>
        <button className="filter-button" onClick={() => setOverlayVisible(true)}>Filter</button>
      </div>

      {overlayVisible && (
        <div className="filter-overlay">
          <div className="filter-container">
            <div className="field-buttons">
              {allFields.map((field) =>
                field !== "codingNum" && field !== "id" && (
                  <button
                    key={field}
                    onClick={() => toggleFieldSelection(field)}
                    className={temporaryFields.includes(field) ? "selectedF" : "notSelected"}
                  >
                    {field}
                  </button>
                )
              )}
            </div>
            <div className="overlay-buttons">
              <button onClick={handleApplyFilter}>Apply</button>
              <button onClick={handleChooseAll}>Choose All</button>
              <button className="exit" onClick={handleExitOverlay}>Exit</button>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <p className="error-message">Error: {error}</p>
      ) : (
        <div className="records-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>codingNum</th>
                {currentRecords.length > 0 &&
                  Object.keys(currentRecords[0])
                    .filter((key) => key !== "codingNum" && key !== "id")
                    .map((key) =>
                      selectedFields.includes(key)
                        ? <th key={key}>{key}</th>
                        : null
                    )}
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => setSelectedRecordId(record.id)}
                  className={`clickable-row ${selectedRecordId === record.id ? "selected" : ""}`}
                >
                  <td>{record.codingNum}</td>
                  {Object.keys(record)
                    .filter((key) => key !== "codingNum" && key !== "id")
                    .map((key) =>
                      selectedFields.includes(key) ? (
                        <td key={key}>
                          {typeof record[key] === 'object'
                            ? JSON.stringify(record[key])
                            : String(record[key])}
                        </td>
                      ) : null
                    )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-buttons">
            <button onClick={handlePrevious} disabled={currentPage === 0}>Previous</button>
            <button
              onClick={handleNext}
              disabled={startIndex + recordsPerPage >= records.length}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedRecordId && (
        <div className="record-buttons">
          <button onClick={() => handleUpdate(records.find(r => r.id === selectedRecordId))}>View</button>
          <button onClick={() => handleDelete(records.find(r => r.id === selectedRecordId))}>Delete</button>
          <button onClick={() => handlePredict(selectedRecordId)}>Predict</button>
        </div>
      )}
    </div>
  );
};

export default RecordsViewer;
