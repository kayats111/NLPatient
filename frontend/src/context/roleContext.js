// src/context/RoleContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const RoleContext = createContext();

// Custom hook to use the role context
export const useRole = () => useContext(RoleContext);

// Create the provider component
export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  // Assuming you want to fetch the user role from an API or localStorage
  useEffect(() => {
    const fetchUserRole = async () => {
      // Here, you could call an API or check localStorage, for example:
    //   const userRole = localStorage.getItem('userRole'); // Example: getting from localStorage
    //   setRole(userRole); // Set the role to the context state
        setRole("Admin");
    };
    fetchUserRole();
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};
