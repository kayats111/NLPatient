import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DrawerMenu from './DrawerMenu'; 
import { useRoleLinks } from "./context/FetchContext";
import { useRole } from './context/roleContext';

function ChoicePage() {
  const navigate = useNavigate();
  const { links } = useRoleLinks();
  const { setRole } = useRole();
  const [adminMessage, setAdminMessage] = useState("");

  const handleChoice = (choice) => {
    if (choice === "Researcher") {
      setRole("researcher");
      navigate('/researcher-main');
    } else if (choice === "Doctor") {
      setRole("doctor");
      navigate('/doctor-main');
    } else if (choice === "Admin") {
      setRole("admin");
      setAdminMessage("You have set your role as admin!"); // Set the message when "Admin" is clicked
    }
  };

  return (
    <div style={styles.container}>
      <DrawerMenu links={links} />
      {/* Conditionally render the message for Admin */}
      {adminMessage && <p style={styles.adminMessage}>{adminMessage}</p>}

      <div style={styles.buttonsContainer}>
        <button style={styles.button} onClick={() => handleChoice('Researcher')}>
          Researcher
        </button>
        <button style={styles.button} onClick={() => handleChoice('Doctor')}>
          Doctor
        </button>
        <button style={styles.button} onClick={() => handleChoice('Admin')}>
          Admin
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column', // Changed from 'row' to 'column' to stack the content
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f9',
  },
  adminMessage: {
    marginBottom: '20px', // Space between message and buttons
    fontSize: '20px',
    color: '#28a745', // Green color to indicate success
    fontWeight: 'bold',
  },
  buttonsContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    fontSize: '24px',
    padding: '20px 40px',
    margin: '20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s',
  },
};
export default ChoicePage
