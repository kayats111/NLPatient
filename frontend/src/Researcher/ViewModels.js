import React, { useEffect, useState,useRef } from "react";
import axios from "axios";
import "./ViewModels.css"; // Import the CSS file
import DrawerMenu from '../DrawerMenu'; 
// import { useResearcherLinks } from '../context/Context';
import { useRoleLinks } from "../context/FetchContext";

function ViewModels() {
  const [modelNames, setModelNames] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelMetadata, setModelMetadata] = useState(null); // To store metadata
  const [error, setError] = useState(null);
  const [fieldsAndLabels, setFieldsAndLabels] = useState(null); // Store fields and labels
  const [selectedFields, setSelectedFields] = useState([]); // Store selected fields
  const [selectedLabels, setSelectedLabels] = useState([]); // Store selected labels
  const [showModal, setShowModal] = useState(false); // Control modal visibility
  const [loading, setLoading] = useState(false); // Loading state for the spinner or status bar
  const [recordCount, setRecordCount] = useState(0); // To store the number of records
  const [trainSize, setTrainSize] = useState(80); // Default train size
  const [testSize, setTestSize] = useState(20); // Default test size
  const { links } = useRoleLinks();
  const [modalStep, setModalStep] = useState(1); // State to track modal step
  const [epoch, setEpoch] = useState(1); // Default value for epoch
  const [numOfBatches, setNumOfBatches] = useState(100); // Default value for number of batches
  const [modelType, setModelType] = useState("");  // Tracks the model type (e.g., 'PyTorch', 'TensorFlow', etc.)
  const [hyperParams,setHyperParams] = useState({})
  const modalRef = useRef(null);  // Create a reference for the modal content
  const [sampleLimit, setSampleLimit] = useState(0); // Default sample limit value
  const [modelNamesData,setModelNamesData] = useState([])
  const [modelTypesData,setModelTypesData] = useState([])
  const [hyperParametersData, setHyperParametersData] = useState({})

  useEffect(() => {
    // Close modal if clicked outside
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleModalClose();  // Close modal
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const fetchModelNames = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/model_trainer/get_names_parameters");
        const modelNamesData = response.data.value.map(item => item.model_name);
        const modelTypesData = response.data.value.map(item => item.model_type);  // Assuming model_type exists
        const hyperParametersData = response.data.value.map(item => item.parameters);  // Extract the hyperParameters field
        setModelNamesData(modelNamesData)
        setModelTypesData(modelTypesData)
        setHyperParametersData(hyperParametersData)
  
        setModelNames(modelNamesData);
        setFilteredModels(modelNamesData);
        
        // Set the modelType (for the selected model)
        if (selectedModel) {
          const modelIndex = modelNamesData.indexOf(selectedModel);
          setHyperParams(hyperParametersData[modelIndex].reduce((acc, param) => {
            acc[param] = ""; // You can initialize it with an empty string or any default value
            return acc;
          },{}))
          setModelType(modelTypesData[modelIndex]);
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

    if (query === "") {
      setFilteredModels(modelNames); // Show all models if search is empty
    } else {
      const filtered = modelNames.filter((model) =>
        model.toLowerCase().includes(query)
      );
      setFilteredModels(filtered);
    }
  };

  const handleTrainClick = async () => {
    if (!selectedModel) return;

    // Start loading
    setLoading(true);

    const dataToSend = { 
      "model name": selectedModel,
      "trainRelativeSize":trainSize,
      "testRelativeSize":testSize,
      "epochs":epoch,
      "batchSize":numOfBatches,
      "sampleLimit":sampleLimit,
      "hyperParameters" : hyperParams,
    };
    console.log(dataToSend)
    // Add fields and labels if they are selected
    if (selectedFields.length > 0 && selectedLabels.length > 0) {
      dataToSend.fields = selectedFields;
      dataToSend.labels = selectedLabels;
    } else if (selectedFields.length > 0) {
      dataToSend.fields = selectedFields;
    } else if (selectedLabels.length > 0) {
      dataToSend.labels = selectedLabels;
    }

    try {
      // Send the request to the backend
      const response = await axios.post("http://localhost:3001/api/model_trainer/run_model", dataToSend);
      alert(`Model Name: ${selectedModel} has been trained successfully!`);
      handleModalClose();
    } catch (error) {
      console.error("Error training the model:", error);
      alert("An error occurred while training the model.");
    } finally {
      setLoading(false);
    }
  };

  const handleModelClick = async (modelName) => {
    setSelectedModel(modelName);
  };

  const handleButtonClick = async (action) => {
    if (!selectedModel) return;

    try {
      if (action === "Train") {
        const response = await axios.get("http://localhost:3000/api/data/fields_labels");
        const { fields, labels } = response.data.value;

        // Sort fields and labels alphabetically
        const sortedFields = fields.sort();
        const sortedLabels = labels.sort();

        setFieldsAndLabels({ fields: sortedFields, labels: sortedLabels });
        setShowModal(true);
        setModalStep(1); // Start with the fields/labels step
      } else if (action === "Delete") {
        const response = await axios.delete("http://localhost:3001/api/model_trainer/delete_model", {
          data: { "model name": selectedModel },
        });

        if (response.data.error) {
          alert("Failed to delete the model: " + response.data.message);
        } else {
          alert(`${selectedModel} has been deleted successfully!`);
          setModelNames(modelNames.filter((name) => name !== selectedModel));
          setFilteredModels(filteredModels.filter((name) => name !== selectedModel));
          setSelectedModel(null);
          setModelMetadata(null);
        }
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleFieldSelection = (field) => {
    setSelectedFields((prevSelectedFields) => {
      if (prevSelectedFields.includes(field)) {
        return prevSelectedFields.filter((selectedField) => selectedField !== field);
      } else {
        return [...prevSelectedFields, field];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedFields(fieldsAndLabels.fields);
    setSelectedLabels(fieldsAndLabels.labels);
  };

  const handleLabelSelection = (label) => {
    setSelectedLabels((prevSelectedLabels) => {
      if (prevSelectedLabels.includes(label)) {
        return prevSelectedLabels.filter((selectedLabel) => selectedLabel !== label);
      } else {
        return [...prevSelectedLabels, label];
      }
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleDownload = async () => {
    if (!selectedModel) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/model_trainer/get_model?model name=${selectedModel}`,
        { responseType: "blob" }
      );

      const link = document.createElement("a");
      link.href = URL.createObjectURL(response.data);
      link.download = `${selectedModel}.py`;
      link.click();
    } catch (error) {
      console.error("Error downloading the model:", error);
      alert("An error occurred while downloading the model.");
    }
  };

  // Fetch the total number of records from the API
  const fetchRecordCount = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/data/read/records/all");
      setRecordCount(response.data.length); // Assuming the response is an array
      // console.log(response.data.value)
      setSampleLimit(response.data.length);
    } catch (error) {
      console.error("Error fetching record count:", error);
    }
  };

  const handleNext = async () => {
    // Move to the next step (train/test slider)
    if (modalStep === 1) {
      setModalStep(2);
      await fetchRecordCount();
    }
    if (modalStep === 2){
      setModalStep(3);
    }
  };

  // Update train and test size based on slider
  const handleSliderChange = (e) => {
    const value = e.target.value;
    setTrainSize(value);
    setTestSize(100 - value);
  };

  const handleSampleLimitChange = (e) => {
    const value = e.target.value;
    setSampleLimit(value);
  };
  

  return (
    <div className="container">
      <DrawerMenu links={links} />
      <h1>Available Models</h1>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        placeholder="Search models..."
        className="search-bar"
        value={searchQuery}
        onChange={handleSearch}
      />
      <ul className="list">
        {filteredModels.map((modelName, index) => (
          <li
            key={index}
            className={`list-item ${selectedModel === modelName ? "active" : ""}`}
            onClick={() => handleModelClick(modelName)}
          >
            {modelName}
          </li>
        ))}
      </ul>
      <div className="button-container">
        <button
          className={`action-button ${selectedModel ? "enabled" : "disabled"}`}
          onClick={() => handleButtonClick("Train")}
          disabled={!selectedModel || loading}
        >
          Train
        </button>
        <button
          className={`action-button ${selectedModel ? "enabled" : "disabled"}`}
          onClick={() => handleButtonClick("Delete")}
          disabled={!selectedModel || loading}
        >
          Delete
        </button>
        <button
          className={`action-button ${selectedModel ? "enabled" : "disabled"}`}
          onClick={handleDownload}
          disabled={!selectedModel || loading}
        >
          Download
        </button>
      </div>

      {/* Modal for fields, labels, and train/test size */}
      {showModal && fieldsAndLabels && (
        <div className="overlay">
          <div className="modal-content" ref={modalRef}>  {/* Add ref here */}
            {modalStep === 1 && (
              <>
                <h2>Select Fields and Labels</h2>
                <h3>Fields</h3>
                <div className="fields-container">
                  {fieldsAndLabels.fields.map((field, index) => (
                    <button
                      key={index}
                      className={`field-button ${selectedFields.includes(field) ? "selected" : ""}`}
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
                      className={`label-button ${selectedLabels.includes(label) ? "selected" : ""}`}
                      onClick={() => handleLabelSelection(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="train-button" onClick={handleNext}>Next</button>
                  <button className="train-button" onClick={handleSelectAll}>Choose All</button>
                  <button className="close-modal" onClick={handleModalClose}>Exit</button>
                </div>
              </>
            )}
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
                  max={recordCount}  // Set max value to recordCount
                  value={sampleLimit}
                  onChange={handleSampleLimitChange}
                />
                <div className="split-values">
                  <span>{`Sample Limit: ${sampleLimit}`}</span>
                </div>

                {modelType === "PyTorch" && (
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
                        onChange={(e) => setNumOfBatches(e.target.value)}
                        min="1"
                      />
                    </div>
                  </div>
                )}
                <button className="train-button" onClick={handleNext}>Next</button>
                <button className="close-modal" onClick={handleModalClose}>
                    Exit
                  </button>
              </div>
              )}
            {modalStep === 3 && (
              <div className="hyperparams-container">
                <h3>Set Hyperparameters</h3>
                {Object.keys(hyperParams).length === 0 ? (
                  <p>No HyperParameters available for this model.</p> // Display message if hyperParams is empty
                ) : (
                  <div className="hyperparams-fields">
                    {/* {console.log(hyperParams)} */}
                    {Object.keys(hyperParams).map((param, index) => (
                      <div key={index} className="hyperparam-field">
                        <label htmlFor={param}>{param}</label>
                        <input
                          type="number"
                          id={param}
                          onChange={(e) => {
                            setHyperParams((prevParams) => ({
                              ...prevParams,
                              [param]: Number(e.target.value),
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
              </div>
)}
          </div>
        </div>
      )}
      {loading && <div className="loading-spinner">Loading...</div>}
    </div>
  );
}

export default ViewModels;
