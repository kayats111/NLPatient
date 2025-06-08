import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DrawerMenu from "../DrawerMenu";
import { useRoleLinks } from "../context/FetchContext";
import { useRole } from "../context/roleContext";
import "./RecordsViewer.css";
import URLContext from "../context/URLContext";
import axios from "axios";

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

  // ─────────────── Predict modal state ───────────────
  const [showPredictModal, setShowPredictModal] = useState(false);
  const [modelNames, setModelNames] = useState([]);
  const [predictError, setPredictError] = useState("");

  // Base‐URL for predictor endpoints
  const predictorsUrl = useContext(URLContext).Predictors;

  // ─────────────── Fields overlay ───────────────
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [temporaryFields, setTemporaryFields] = useState(["codingNum", "id"]);
  const [allFields, setAllFields] = useState([]);

  // ─────────────── Fetch all records ───────────────
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(server_url + "/read/records/all");
        if (!response.ok)
          throw new Error(`Failed to fetch records: ${response.status}`);
        const data = await response.json();

        setRecords(data);
        if (data.length > 0) {
          const all = Object.keys(data[0]);
          const userVisible = all.filter((k) => k !== "id" && k !== "codingNum");
          setAllFields(all);
          setSelectedFields(["codingNum", ...userVisible]);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchRecords();
  }, [server_url]);

  // ─────────────── Pagination ───────────────
  const startIndex = currentPage * recordsPerPage;
  const currentRecords = records.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const handlePrevious = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };
  const handleNext = () => {
    setCurrentPage((prevPage) =>
      prevPage < Math.ceil(records.length / recordsPerPage) - 1
        ? prevPage + 1
        : prevPage
    );
  };

  // ─────────────── Update & Delete handlers ───────────────
  const handleUpdate = (record) => {
    navigate("/update-medical-records", { state: { record } });
  };

  const handleDelete = async (record) => {
    const id = record.id;
    try {
      await fetch(server_url + `/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      alert(`Record ID: ${record.codingNum}, Deleted Successfully`);
      window.location.reload();
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  // ─────────────── Opening Predict modal ───────────────
  const handlePredict = (id) => {
    setSelectedRecordId(id);
    setShowPredictModal(true);
    setPredictError("");
  };

  // ─────────────── Fetch model names when modal opens ───────────────
  useEffect(() => {
    if (!showPredictModal) return;

    const fetchModelNames = async () => {
      try {
        const response = await axios.get(
          predictorsUrl + "/api/predictors/names"
        );
        const data = response.data;
        if (data.error) {
          setPredictError(data.message || "Failed to load models.");
        } else {
          setModelNames(data.value || []);
        }
      } catch (err) {
        setPredictError("Failed to fetch model names.");
      }
    };

    fetchModelNames();
  }, [showPredictModal, predictorsUrl]);

  const closePredictModal = () => {
    setShowPredictModal(false);
    setModelNames([]);
    setPredictError("");
  };

  // ─────────────── Choose a model, fetch its metadata, and navigate ───────────────
  const chooseModel = async (modelName) => {
    if (!selectedRecordId) {
      setPredictError("No record selected for prediction.");
      return;
    }
    try {
      const response = await axios.post(
        predictorsUrl + "/api/predictors/meta_data",
        { "model name": modelName }
      );
      const data = response.data;
      if (data.error) {
        setPredictError(data.message);
        return;
      }
      const metadata = data.value; // { fields: [...], labels: [...] }

      // Find selected record object
      const record = records.find((r) => r.id === selectedRecordId);
      if (!record) {
        setPredictError("Selected record not found.");
        return;
      }
      // Build sample array in the order of metadata.fields
      const sample = metadata.fields.map((field) => record[field]);

      // Navigate to doctor-predict, passing modelName, modelMetadata, labels, and sample
      navigate("/doctor-predict", {
        state: {
          modelName,
          modelMetadata: metadata.fields,
          labels: metadata.labels,
          model_type:metadata["model type"],
          sample,
        },
      });
    } catch (err) {
      setPredictError("Failed to fetch model metadata for prediction");
    }
  };

  // ─────────────── Field‐filter overlay logic ───────────────
  const toggleFieldSelection = (field) => {
    if (field === "codingNum" || field === "id") return;
    setTemporaryFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };
  const handleChooseAll = () => {
    setTemporaryFields(allFields);
  };
  const handleApplyFilter = () => {
    const guaranteedFields = [
      "id",
      "codingNum",
      ...temporaryFields.filter((f) => f !== "id" && f !== "codingNum"),
    ];
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
        <button
          className="filter-button"
          onClick={() => setOverlayVisible(true)}
        >
          Filter
        </button>
      </div>

      {overlayVisible && (
        <div className="filter-overlay">
          <div className="filter-container">
            <div className="field-buttons">
              {allFields.map(
                (field) =>
                  field !== "codingNum" &&
                  field !== "id" && (
                    <button
                      key={field}
                      onClick={() => toggleFieldSelection(field)}
                      className={
                        temporaryFields.includes(field)
                          ? "selectedF"
                          : "notSelected"
                      }
                    >
                      {field}
                    </button>
                  )
              )}
            </div>
            <div className="overlay-buttons">
              <button onClick={handleApplyFilter}>Apply</button>
              <button onClick={handleChooseAll}>Choose All</button>
              <button className="exit" onClick={handleExitOverlay}>
                Exit
              </button>
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
                      selectedFields.includes(key) ? (
                        <th key={key}>{key}</th>
                      ) : null
                    )}
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => setSelectedRecordId(record.id)}
                  className={`clickable-row ${
                    selectedRecordId === record.id ? "selected" : ""
                  }`}
                >
                  <td>{record.codingNum}</td>
                  {Object.keys(record)
                    .filter((key) => key !== "codingNum" && key !== "id")
                    .map((key) =>
                      selectedFields.includes(key) ? (
                        <td key={key}>
                          {typeof record[key] === "object"
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
        </div>
      )}

      {selectedRecordId && (
        <div className="record-buttons">
          <button
            onClick={() =>
              handleUpdate(records.find((r) => r.id === selectedRecordId))
            }
          >
            View
          </button>
          <button
            onClick={() =>
              handleDelete(records.find((r) => r.id === selectedRecordId))
            }
          >
            Delete
          </button>
          <button onClick={() => handlePredict(selectedRecordId)}>
            Predict
          </button>
        </div>
      )}

      {/* ─────────────── Predict Modal ─────────────── */}
      {showPredictModal && (
        <div className="predict-modal-overlay">
          <div className="predict-modal-content">
            <h2>Select a Model to Predict</h2>
            {predictError ? (
              <p className="error-message">{predictError}</p>
            ) : (
              <div className="model-list">
                {modelNames.map((name) => (
                  <button
                    key={name}
                    className="model-button"
                    onClick={() => chooseModel(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
            <button className="close-modal" onClick={closePredictModal}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsViewer;
