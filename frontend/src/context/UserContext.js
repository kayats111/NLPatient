import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the UserContext
const UserContext = createContext();

// UserProvider to manage user state and persistence
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load the user data from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Parse and set user if it's found in localStorage
    }
  }, []); // The empty dependency array ensures this runs only once on mount

  const login = (userData) => {
    setUser(userData); // Set the user data in the context
    localStorage.setItem('user', JSON.stringify(userData)); // Store the user data in localStorage
  };

  const logout = () => {
    setUser(null); // Clear the user from state
    localStorage.removeItem('user'); // Remove the user data from localStorage
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use user context
export const useUser = () => useContext(UserContext);
