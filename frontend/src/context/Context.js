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
    { name: "Predict", path: "/train-page" },
    {name:"Role Page", path:"/choicepage"},
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
    {name: "Add New Model",path:"/model_uploader"},
    { name: "View Models", path: "/model-viewer" },
    { name: "Trained Models", path: "/train-page" },
    { name: "Patient Records", path: "/records-viewer" },
    {name:"Role Page", path:"/choicepage"},
  ]);

  return (
    <ResearcherMenu.Provider value={{ links }}>
      {children}
    </ResearcherMenu.Provider>
  );
};
  // Create the context
  const AdminMenu = createContext();

  // Custom hook to access the context
  export const useAdminLinks = () => useContext(AdminMenu);
  
  // Create a provider component
  export const AdminMenuProvider = ({ children }) => {
    const [links] = useState([
      { name: "Doctor Dashboard", path: "/doctor-main" },
      { name: "Patient Records", path: "/records-viewer" },
      { name: "Add Patient Data", path: "/add-patient-data" },
      { name: "Researcher Dashboard", path: "/researcher-main" },
      {name: "Add New Model",path:"/model_uploader"},
      { name: "View Models", path: "/model-viewer" },
      { name: "Trained Models", path: "/train-page" },
      {name:"Role Page", path:"/choicepage"},
    ]);
  
    return (
      <AdminMenu.Provider value={{ links }}>
        {children}
      </AdminMenu.Provider>
    );
  };
