import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./RecordsUpdate.css"; 
import axios from "axios"; // For sending HTTP requests
import { Navigate, useNavigate } from 'react-router-dom';



const RecordsUpdate = () => {
  const navigate = useNavigate(); // Use the hook for navigation
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

  const handleSaveCHanges = async ()=>{
    try{
      await axios.patch("http://localhost:3000/api/data/update", updatedRecord);
      alert("Changes Saved!")
      navigate("/records-viewer")
    } catch (error) {
      console.error("Error uploading row:", updatedRecord, error);
    }
  }
  return (
    <div className="update-container">
      <h1>Update Record</h1>
      <div className="update-form-grid">
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
      </div>
      <button
        className="update-save-button"
        onClick={() => handleSaveCHanges()}
      >
        Save Changes
      </button>
    </div>
  );
};

export default RecordsUpdate;
