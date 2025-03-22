// src/context/LinksContext.js
import React, { createContext, useState, useContext } from 'react';

// Create the context
const DoctorMenu = createContext();

// Custom hook to access the context
export const useDoctorLinks = () => useContext(DoctorMenu);

// Create a provider component
export const DoctorMenuProvider = ({ children }) => {
  const [links] = useState([
    { name: "Doctor Dashboard", path: "/doctor-main" },
    { name: "Patient Records", path: "/records-viewer" },
    { name: "Add Patient Data", path: "/add-patient-data" },
    { name: "Predict", path: "/DPredict" }
  ]);

  return (
    <DoctorMenu.Provider value={{ links }}>
      {children}
    </DoctorMenu.Provider>
  )
};

  // Create the context
const ResearcherMenu = createContext();

// Custom hook to access the context
export const useResearcherLinks = () => useContext(ResearcherMenu);

// Create a provider component
export const ResearcherMenuProvider = ({ children }) => {
  const [links] = useState([
    { name: "Researcher Dashboard", path: "/researcher-main" },
    { name: "View Models", path: "/model-viewer" },
    { name: "Trained Models", path: "/train-page" },
    { name: "Medical Records", path: "/records-viewer" },
  ]);

  return (
    <ResearcherMenu.Provider value={{ links }}>
      {children}
    </ResearcherMenu.Provider>
  );
};
