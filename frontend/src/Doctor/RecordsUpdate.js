import React, { useState,useContext } from "react";
import { useLocation } from "react-router-dom";
import "./RecordsUpdate.css"; 
import axios from "axios";
import { Navigate, useNavigate } from 'react-router-dom';
import { useRole } from "../context/roleContext";
import { useRoleLinks } from "../context/FetchContext";
import DrawerMenu from '../DrawerMenu'; 
import URLContext from '../context/URLContext';



const RecordsUpdate = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const record = state?.record || {}; 
  const [updatedRecord, setUpdatedRecord] = useState(record); 
  const { role } = useRole();
  const { links } = useRoleLinks();
  const url = useContext(URLContext).DataManager
  // console.log("bug",links)

  // Handle input changes
  const handleInputChange = (key, value) => {
    setUpdatedRecord({
      ...updatedRecord,
      [key]: value,
    });
  };

  const handleSaveChanges = async () => {
    try {
      await axios.patch(url+"/api/data/update", updatedRecord);
      alert("Changes Saved!");
      navigate("/doctor-main");
    } catch (error) {
      console.error("Error uploading row:", updatedRecord, error);
    }
  };

  const isEditable = role === "Doctor" || role === "Admin";
  return (
    <div className="update-container">
      <DrawerMenu links = {links} />
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
              disabled={role === "Researcher"} // Disable input for researcher role
            />
          </div>
        ))}
      </div>
      {isEditable && ( // Show button only if the role is doctor or admin
        <button
          className="update-save-button"
          onClick={handleSaveChanges}
        >
          Save Changes
        </button>
      )}
    </div>
  );
};

export default RecordsUpdate;
