import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewModels.css"; // Import the CSS file
import DoctorDrawerMenu from '../Doctor/DoctorDrawerMenu'; 
import { useResearcherLinks } from '../Context';

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
  const {links} = useResearcherLinks();
  
  useEffect(() => {
    // Fetch model names from the backend
    const fetchModelNames = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/model_trainer/get_names");
        setModelNames(response.data.value); // Assumes response contains { value: [names] }
        setFilteredModels(response.data.value); // Initially display all models
      } catch (err) {
        console.error("Error fetching model names:", err);
        setError("Failed to fetch model names. Please try again.");
      }
    };

    fetchModelNames();
  }, []);

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

    // Create the initial data object with the model name
    let dataToSend = { "model name": selectedModel };

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

      // Handle the response, e.g., display success or metadata
      // console.log(response.data);
      alert(`Model Name: ${selectedModel} has been trained successfully!`)
      handleModalClose()
    } catch (error) {
      console.error("Error training the model:", error);
      alert("An error occurred while training the model.");
    } finally {
      // Stop loading after request completion
      setLoading(false);
    }
  };

  const handleModelClick = async (modelName) => {
    setSelectedModel(modelName); // Set the selected model
    // setModelMetadata(null); // Clear previous metadata
  };

  const handleButtonClick = async (action) => {
    if (!selectedModel) return;

    try {
      if (action === "Train") {
        // Fetch fields and labels from port 3000
        const response = await axios.get("http://localhost:3000/api/data/fields_labels");
        const { fields, labels } = response.data.value;

        // Sort fields and labels alphabetically
        const sortedFields = fields.sort();
        const sortedLabels = labels.sort();

        setFieldsAndLabels({ fields: sortedFields, labels: sortedLabels }); // Store sorted fields and labels
        setShowModal(true); // Show modal with the fields and labels
      } else if (action === "Delete") {
        const response = await axios.delete("http://localhost:3001/api/model_trainer/delete_model", {
          data: { "model name": selectedModel },
        });

        if (response.data.error) {
          alert("Failed to delete the model: " + response.data.message);
        } else {
          alert(`${selectedModel} has been deleted successfully!`);
          setModelNames(modelNames.filter((name) => name !== selectedModel)); // Remove model from the list
          setFilteredModels(filteredModels.filter((name) => name !== selectedModel)); // Update the filtered list
          setSelectedModel(null); // Reset selected model
          setModelMetadata(null); // Clear metadata
        }
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleFieldSelection = (field) => {
    setSelectedFields((prevSelectedFields) => {
      if (prevSelectedFields.includes(field)) {
        // If field is already selected, remove it
        return prevSelectedFields.filter((selectedField) => selectedField !== field);
      } else {
        // Otherwise, add the field to the selection
        return [...prevSelectedFields, field];
      }
    });
  };

  const handleLabelSelection = (label) => {
    setSelectedLabels((prevSelectedLabels) => {
      if (prevSelectedLabels.includes(label)) {
        // If label is already selected, remove it
        return prevSelectedLabels.filter((selectedLabel) => selectedLabel !== label);
      } else {
        // Otherwise, add the label to the selection
        return [...prevSelectedLabels, label];
      }
    });
  };

  const handleModalClose = () => {
    setShowModal(false); // Close the modal
  };

  const handleDownload = async () => {
    if (!selectedModel) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/model_trainer/get_model?model name=${selectedModel}`,
        { responseType: "blob" }
      );

      // Create a link to download the file
      const link = document.createElement("a");
      link.href = URL.createObjectURL(response.data);
      link.download = `${selectedModel}.py`; // Assuming the file is a Python file
      link.click();
    } catch (error) {
      console.error("Error downloading the model:", error);
      alert("An error occurred while downloading the model.");
    }
  };

  return (
    <div className="container">
      <DoctorDrawerMenu links = {links} />
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
          disabled={!selectedModel || loading} // Disable during loading
        >
          Train
        </button>
        <button
          className={`action-button ${selectedModel ? "enabled" : "disabled"}`}
          onClick={() => handleButtonClick("Delete")}
          disabled={!selectedModel || loading} // Disable during loading
        >
          Delete
        </button>
        {/* Download Button */}
        <button
          className={`action-button ${selectedModel ? "enabled" : "disabled"}`}
          onClick={handleDownload}
          disabled={!selectedModel || loading} // Disable during loading
        >
          Download
        </button>
      </div>

      {/* Modal to select fields and labels */}
      {showModal && fieldsAndLabels && (
        <div className="overlay">
          <div className="modal-content">
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
              <button className="train-button" onClick={handleTrainClick} disabled={loading}>
                {loading ? "Training..." : "Train"}
              </button>
              <button className="close-modal" onClick={handleModalClose}>Exit</button>
            </div>
          </div>
        </div>
      )}

      {/* Show loading spinner if loading is true */}
      {loading && <div className="loading-spinner">Loading...</div>}
    </div>
  );
}

export default ViewModels;
