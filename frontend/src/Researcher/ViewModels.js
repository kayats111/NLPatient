import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewModels.css"; // Import the CSS file

function ViewModels() {
  const [modelNames, setModelNames] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);
  const [error, setError] = useState(null);

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

  const handleModelClick = (modelName) => {
    setSelectedModel(modelName); // Set the selected model
  };

  const handleButtonClick = async (action) => {
    if (!selectedModel) return;

    try {
      if (action === "Delete") {
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
        }
      } else {
        alert(`${action} action triggered for: ${selectedModel}`);
        // Implement other actions like "Train" or "MetaData"
      }
    } catch (error) {
      console.error("Error during the delete action:", error);
      alert("An error occurred while trying to delete the model.");
    }
  };

  return (
    <div className="container">
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
          disabled={!selectedModel}
        >
          Train
        </button>
        <button
          className={`action-button ${selectedModel ? "enabled" : "disabled"}`}
          onClick={() => handleButtonClick("Delete")}
          disabled={!selectedModel}
        >
          Delete
        </button>
        
      </div>
    </div>
  );
}

export default ViewModels;
