// src/context/RoleContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
const RoleContext = createContext();
export const useRole = () => useContext(RoleContext);
export const RoleProvider = ({ children }) => {
  // ✅ Use initializer to load from localStorage *synchronously*
  const [role, setRole] = useState(() => {
    return localStorage.getItem('userRole') || null;
  });

  // ✅ Save to localStorage whenever role changes
  useEffect(() => {
    if (role) {
      localStorage.setItem('userRole', role);
    } else {
      localStorage.removeItem('userRole'); // Clean up if logged out
    }
  }, [role]);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};
