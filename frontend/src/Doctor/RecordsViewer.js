import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import DrawerMenu from '../DrawerMenu'; 
import { useRoleLinks } from "../context/FetchContext";
import { useRole } from "../context/roleContext";
import "./RecordsViewer.css";

const server_url = "http://localhost:3000/api/data";

const RecordsViewer = () => {
  const navigate = useNavigate(); 
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]); // This holds the filtered records
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 10;
  const { links } = useRoleLinks();
  const { role } = useRole();
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  // Filter overlay state
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]); // Tracks the fields selected by the user
  const [temporaryFields, setTemporaryFields] = useState(["codingNum","id"]); // Temporary state for selected fields before Apply
  const [allFields, setAllFields] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(server_url + "/read/records/all");
        if (!response.ok) {
          throw new Error(`Failed to fetch records: ${response.status}`);
        }
        const data = await response.json();
        setRecords(data);
        setFilteredRecords(data); // Initialize filteredRecords with all records

        // Set all fields for the filter overlay
        if (data.length > 0) {
          setAllFields(Object.keys(data[0]));
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchRecords();
  }, []);

  // Calculate the current records to display
  const startIndex = currentPage * recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage);

  const handlePrevious = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNext = () => {
    setCurrentPage((prevPage) =>
      prevPage < Math.ceil(filteredRecords.length / recordsPerPage) - 1 ? prevPage + 1 : prevPage
    );
  };

  const handleUpdate = (record) => {
    navigate("/update-medical-records", { state: { record } });
  };

  const handleDelete = async (record) => {
    let id = record.id;
    try {
      const response = await fetch(server_url + `/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // Handle the filter overlay logic
  const toggleFieldSelection = (field) => {
    setTemporaryFields((prevTemporaryFields) =>
      prevTemporaryFields.includes(field)
        ? prevTemporaryFields.filter((item) => item !== field)
        : [...prevTemporaryFields, field]
    );
  };

  const handleChooseAll = () => {
    setTemporaryFields(allFields);
  };

  const handleApplyFilter = () => {
    // Apply the filter by selecting only the fields that are in temporaryFields
    const filtered = records.map((record) => {
      const filteredRecord = {};
      Object.keys(record).forEach((key) => {
        if (temporaryFields.includes(key) || temporaryFields.length === 0) {
          filteredRecord[key] = record[key];
        }
      });
      return filteredRecord;
    });
    setFilteredRecords(filtered); // Update filtered records
    setSelectedFields(temporaryFields); // Save the selected fields
    setTemporaryFields([])
    setOverlayVisible(false); // Hide the overlay
  };

  const handleExitOverlay = () => {
    setOverlayVisible(false);
  };

  return (
    <div>
      <DrawerMenu links={links} />
      <div className="center-container">
      <h1>Patient Records</h1>
        <button className="filter-button" onClick={() => setOverlayVisible(true)}>
          Filter
        </button>
      </div>
      {overlayVisible && (
        <div className="filter-overlay">
          <div className="filter-container">
            <div className="field-buttons">
            {allFields.map((field) => (
              field !== "codingNum" && field !=="id" && (  // Check if the field is not "codingNum"
                <button
                  key={field}
                  onClick={() => toggleFieldSelection(field)}
                  className={temporaryFields.includes(field) ? "selectedF" : ""}
                >
                  {field}
                </button>
                )
            ))}
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
                    .filter((key) => key !== "codingNum")
                    .map((key) => {
                      if (selectedFields.length === 0 || selectedFields.includes(key)) {
                        return <th key={key}>{key}</th>;
                      }
                      return null;
                    })}
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
                    .filter((key) => key !== "codingNum")
                    .map((key) => {
                      if (selectedFields.length === 0 || selectedFields.includes(key)) {
                        return <td key={key}>{String(record[key])}</td>;
                      }
                      return null;
                    })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-buttons">
            <button onClick={handlePrevious} disabled={currentPage === 0}>
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={startIndex + recordsPerPage >= filteredRecords.length}
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
