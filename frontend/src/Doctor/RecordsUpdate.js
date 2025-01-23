import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./RecordsUpdate.css"; 

const RecordsUpdate = () => {
  const { state } = useLocation();
  const record = state?.record || {}; 
  const [updatedRecord, setUpdatedRecord] = useState(record); 

  // Handle input changes
  const handleInputChange = (key, value) => {
    setUpdatedRecord({
      ...updatedRecord,
      [key]: value,
    });
  };

  return (
    <div className="update-container">
      <h1>Update Record</h1>
      {Object.entries(updatedRecord).map(([key, value]) => (
        <div key={key} className="update-field">
          <label className="update-label">{key}:</label>
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="update-input"
          />
        </div>
      ))}
      <button
        className="update-save-button"
        onClick={() => console.log("Updated Record:", updatedRecord)}
      >
        Save Changes
      </button>
    </div>
  );
};

export default RecordsUpdate;
