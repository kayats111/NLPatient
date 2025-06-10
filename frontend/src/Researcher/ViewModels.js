import React, { useEffect, useState, useRef, useContext } from "react";
import DrawerMenu from "../DrawerMenu";
import { useRoleLinks } from "../context/FetchContext";
import URLContext from "../context/URLContext";
import axios from "axios";
import "./ViewModels.css"; // Import the CSS file

function ViewModels() {
  const { links } = useRoleLinks();
  const urls = useContext(URLContext);

  // ─────────────── State Hooks ───────────────
  const [modelNames, setModelNames] = useState([]); // just the names
  const [filteredModels, setFilteredModels] = useState([]); // filtered names
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);
  const [error, setError] = useState(null);

  // We keep these parallel arrays so we know each model's type and parameters:
  const [modelNamesData, setModelNamesData] = useState([]); // same as modelNames, but raw
  const [modelTypesData, setModelTypesData] = useState([]); // e.g. ["NLP", "PYTORCH", "SCIKIT", ...]
  const [hyperParametersData, setHyperParametersData] = useState({});

  // … (other state hooks for modal, fields/labels, loading, etc.) …
  const [fieldsAndLabels, setFieldsAndLabels] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recordCount, setRecordCount] = useState(0);
  const [trainSize, setTrainSize] = useState(80);
  const [testSize, setTestSize] = useState(20);
  const [modalStep, setModalStep] = useState(1);
  const [epoch, setEpoch] = useState(1);
  const [numOfBatches, setNumOfBatches] = useState(100);
  const [modelType, setModelType] = useState("");
  const [hyperParams, setHyperParams] = useState({});
  const [sampleLimit, setSampleLimit] = useState(0);

  const modalRef = useRef(null);

  // ─────────────── Effect: Click‐outside to close modal ───────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleModalClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ─────────────── Effect: Fetch model‐name + model‐type + params ───────────────
  useEffect(() => {
    const fetchModelNames = async () => {
      try {
        const response = await axios.get(
          urls.ModelTrainer + "/api/model_trainer/get_names_parameters"
        );
        // Assuming response.data.value is an array of objects like:
        //    { model_name: "MyModel", model_type: "NLP", parameters: [ ... ] }
        const raw = response.data.value;
        const names = raw.map((item) => item.model_name);
        const types = raw.map((item) => item.model_type);
        const params = raw.map((item) => item.parameters);

        setModelNamesData(names);
        setModelTypesData(types);
        setHyperParametersData(params);

        // Initialize displayed lists:
        setModelNames(names);
        setFilteredModels(names);

        // If we've already selected a model, preset its type + hyperParams
        if (selectedModel) {
          const idx = names.indexOf(selectedModel);
          setHyperParams(
            params[idx].reduce((acc, param) => {
              acc[param] = "";
              return acc;
            }, {})
          );
          setModelType(types[idx]);
        }
      } catch (err) {
        console.error("Error fetching model names:", err);
        setError("Failed to fetch model names. Please try again.");
      }
    };

    fetchModelNames();
  }, [selectedModel]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // If the user types exactly "nlp", we want both "nlp" and "bert" types:
    if ("nlp".startsWith(query) && query !== "") {
      const filtered = modelNamesData.filter((_, idx) => {
        const typeLower = modelTypesData[idx].toLowerCase();
        return typeLower === "nlp" || typeLower === "bert";
      });
      setFilteredModels(filtered);
      return;
    }

    // Otherwise, a list of lowercase model‐types we care about:
    const typeKeywords = ["bert", "scikit", "pytorch"];

    // Find which types (if any) begin with the query string:
    const matchedTypes = typeKeywords.filter((type) =>
      type.startsWith(query)
    );

    if (matchedTypes.length > 0) {
      const filtered = modelNamesData.filter((_, idx) => {
        const typeLower = modelTypesData[idx].toLowerCase();
        return matchedTypes.includes(typeLower);
      });
      setFilteredModels(filtered);
    } else if (query === "") {
      // If search box is empty, show all
      setFilteredModels(modelNames);
    } else {
      // Otherwise, fall back to name‐contains filtering
      const filtered = modelNames.filter((name) =>
        name.toLowerCase().includes(query)
      );
      setFilteredModels(filtered);
    }
  };

  // ─────────────── Fetch record count ───────────────
  const fetchRecordCount = async () => {
    let response;
    if (modelType === "BERT") {
      response = await axios.get(urls.DataManager +"/api/data/text/read/records/all");
    } else {
      response = await axios.get(
        urls.DataManager + "/api/data/read/records/all"
      );
    }
    const count = response.data.length;
    setRecordCount(count);
    setSampleLimit(count);
    return count;
  };

  // ─────────────── Rest of your handlers (Train, Delete, Download, etc.) ───────────────
  const handleTrainClick = async () => {
    if (!selectedModel) return;
    setLoading(true);

    const dataToSend = {
      "model name": selectedModel,
      trainRelativeSize: Number(trainSize),
      testRelativeSize: testSize,
      epochs: epoch,
      batchSize: Number(numOfBatches),
      hyperParameters: hyperParams,
    };

    // Only include fields/labels if modelType is not NLP
    if (modelType !== "BERT") {
      dataToSend.sampleLimit = Number(sampleLimit)
      if (selectedFields.length > 0) {
        dataToSend.fields = selectedFields;
      }
      if (selectedLabels.length > 0) {
        dataToSend.labels = selectedLabels;
      }
    } else {
      // For NLP, include all labels
      dataToSend.labels = fieldsAndLabels.labels;
    }

    try {
      if (modelType !== "BERT"){
        await axios.post(
          urls.ModelTrainer + "/api/model_trainer/run_model",
          dataToSend
        );
      }
      else{
        // console.log("got here");
        await axios.post(
          urls.ModelTrainer + "/api/model_trainer/text/run",
          dataToSend
        );
      }
      alert(`Model ${selectedModel} has been trained successfully!`);
      handleModalClose();
    } catch (error) {
      console.error("Error training the model:", error);
      alert("An error occurred while training the model.",error);
    } finally {
      setLoading(false);
    }
  };

  const handleModelClick = (modelName) => {
    setSelectedModel(modelName);
    const idx = modelNamesData.indexOf(modelName);
    if (idx !== -1) {
      setModelType(modelTypesData[idx]);
      // Reset previously set fields/labels
      setSelectedFields([]);
      setSelectedLabels([]);
    }
  };

  const handleButtonClick = async (action) => {
    if (!selectedModel) return;

    try {
      if (action === "Train") {
        const response = await axios.get(
          urls.DataManager + "/api/data/fields_labels"
        );
        const { fields, labels } = response.data.value;
        const sortedFields = fields.sort();
        const sortedLabels = labels.sort();
        setFieldsAndLabels({ fields: sortedFields, labels: sortedLabels });

        if (modelType === "BERT") {
          // 1) For NLP: fetch record count (and update sampleLimit),
          // 2) then select all labels, set modalStep to 2, and show the modal:
          const count = await fetchRecordCount();
          setSampleLimit(count > 0 ? count : 1);
          setSelectedLabels(sortedLabels);
          setModalStep(2);
          setShowModal(true);
        } else {
          // Non‐NLP: open at Step 1 for user to pick fields/labels
          setModalStep(1);
          setShowModal(true);
        }
      } else if (action === "Delete") {
        const response = await axios.delete(
          urls.ModelTrainer + "/api/model_trainer/delete_model",
          {
            data: { "model name": selectedModel },
          }
        );
        if (response.data.error) {
          alert("Failed to delete the model: " + response.data.message);
        } else {
          alert(`${selectedModel} has been deleted successfully!`);
          setModelNames(modelNames.filter((n) => n !== selectedModel));
          setFilteredModels(filteredModels.filter((n) => n !== selectedModel));
          setSelectedModel(null);
        }
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleFieldSelection = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleLabelSelection = (label) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(fieldsAndLabels.fields);
    setSelectedLabels(fieldsAndLabels.labels);
  };

  const handleModalClose = () => {
    setSelectedFields([]);
    setSelectedLabels([]);
    setShowModal(false);
    setModalStep(1);
  };

  const handleDownload = async () => {
    if (!selectedModel) return;
    try {
      const response = await axios.post(
        urls.ModelTrainer + "/api/model_trainer/get_model",
        { "model name": selectedModel },
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "text/x-python" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedModel}.py`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading the model:", error);
      alert("An error occurred while downloading the model.");
    }
  };

  const handleNext = async () => {
    if (modalStep === 1) {
      setModalStep(2);
      await fetchRecordCount();
    } else if (modalStep === 2) {
      setModalStep(3);
    }
  };

  const handleSliderChange = (e) => {
    const value = e.target.value;
    setTrainSize(value);
    setTestSize(100 - value);
  };

  const handleSampleLimitChange = (e) => {
    setSampleLimit(e.target.value);
  };

  // ─────────────── Render ───────────────
  return (
    <div className="vmc">
      <DrawerMenu links={links} />
      <h1>Available Models</h1>
      {error && <p className="error">{error}</p>}

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search models..."
        className="search-bar"
        value={searchQuery}
        onChange={handleSearch}
      />

      <ul className="list">
        {filteredModels.map((modelName, idx) => (
          <li
            key={idx}
            className={`list-item ${
              selectedModel === modelName ? "active" : ""
            }`}
            onClick={() => handleModelClick(modelName)}
          >
            {modelName}
          </li>
        ))}
      </ul>

      <div className="button-container">
        <button
          className={`action-button ${
            selectedModel ? "enabled" : "disabled"
          }`}
          onClick={() => handleButtonClick("Train")}
          disabled={!selectedModel || loading}
        >
          Train
        </button>
        <button
          className={`action-button ${
            selectedModel ? "enabled" : "disabled"
          }`}
          onClick={() => handleButtonClick("Delete")}
          disabled={!selectedModel || loading}
        >
          Delete
        </button>
        <button
          className={`action-button ${
            selectedModel ? "enabled" : "disabled"
          }`}
          onClick={handleDownload}
          disabled={!selectedModel || loading}
        >
          Download
        </button>
      </div>

      {/* Modal Overlay */}
      {showModal && fieldsAndLabels && (
        <div className="overlay">
          <div className="modal-content" ref={modalRef}>
            {/* Step 1: Fields & Labels — only render if modelType !== "NLP" */}
            {modalStep === 1 && modelType !== "BERT" && (
              <>
                <h2>Select Fields and Labels</h2>
                <h3>Fields</h3>
                <div className="fields-container">
                  {fieldsAndLabels.fields.map((field, index) => (
                    <button
                      key={index}
                      className={`field-button ${
                        selectedFields.includes(field) ? "selected" : ""
                      }`}
                      onClick={() => handleFieldSelection(field)}
                    >
                      {field}
                    </button>
                  ))}
                </div>
                <h3>Labels</h3>
                <div className="labels-container">
                  {fieldsAndLabels.labels.map((label, index) => (
                    <button
                      key={index}
                      className={`label-button ${
                        selectedLabels.includes(label) ? "selected" : ""
                      }`}
                      onClick={() => handleLabelSelection(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="train-button" onClick={handleNext}>
                    Next
                  </button>
                  <button className="train-button" onClick={handleSelectAll}>
                    Choose All
                  </button>
                  <button className="close-modal" onClick={handleModalClose}>
                    Exit
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Train/Test Split & (if PYTORCH) hyperparameter inputs */}
            {modalStep === 2 && (
              <div className="slider-container">
                <h3>Select Train/Test Split</h3>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={trainSize}
                  onChange={handleSliderChange}
                />
                <div className="split-values">
                  <span>{`Train: ${trainSize}%`}</span>
                  <span>{`Test: ${testSize}%`}</span>
                </div>

                <h3>Set Sample Limit</h3>
                <input
                  type="range"
                  min="1"
                  max={recordCount}
                  value={sampleLimit}
                  onChange={handleSampleLimitChange}
                />
                <div className="split-values">
                  <span>{`Sample Limit: ${sampleLimit}`}</span>
                </div>

                {(modelType === "PYTORCH" || modelType == "BERT") && (
                  <div className="input-fields">
                    <div className="input-field">
                      <label htmlFor="epoch">Epoch</label>
                      <input
                        type="number"
                        id="epoch"
                        value={epoch}
                        onChange={(e) => setEpoch(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="input-field">
                      <label htmlFor="numBatches">Batch Size</label>
                      <input
                        type="number"
                        id="numBatches"
                        value={numOfBatches}
                        onChange={(e) => setNumOfBatches(Number(e.target.value))}
                        min="1"
                      />
                    </div>
                  </div>
                )}
                <button className="train-button" onClick={handleNext}>
                  Next
                </button>
                <button className="close-modal" onClick={handleModalClose}>
                  Exit
                </button>
              </div>
            )}

            {/* Step 3: Set Hyperparameters */}
            {modalStep === 3 && (
              <div className="hyperparams-container">
                <h3>Set Hyperparameters</h3>
                {Object.keys(hyperParams).length === 0 ? (
                  <p>No HyperParameters available for this model.</p>
                ) : (
                  <div className="hyperparams-fields">
                    {Object.keys(hyperParams).map((param, index) => (
                      <div key={index} className="hyperparam-field">
                        <label htmlFor={param}>{param}</label>
                        <input
                          id={param}
                          onChange={(e) => {
                            const value = e.target.value;
                            const isValidNumber =
                              !isNaN(value) &&
                              value.trim() !== "" &&
                              /^\d+(\.\d+)?$/.test(value);

                            setHyperParams((prev) => ({
                              ...prev,
                              [param]: isValidNumber
                                ? Number(value)
                                : value,
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="modal-actions">
                  <button className="train-button" onClick={handleTrainClick}>
                    Train Model
                  </button>
                  <button className="close-modal" onClick={handleModalClose}>
                    Exit
                  </button>
                </div>
                {loading && <div className="loading-spinner">Loading...</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewModels;
