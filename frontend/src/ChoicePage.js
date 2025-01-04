import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';


function ChoicePage(){
    const navigate = useNavigate();

    const handleChoice = (choice) => {
        if (choice === "Researcher"){
            navigate('/researcher-main');
        }
        else{
            navigate('/doctor-main');
        }
    };
    return (
        <div style={styles.container}>
          <button style={styles.button} onClick={() => handleChoice('Researcher')}>
            Researcher
          </button>
          <button style={styles.button} onClick={() => handleChoice('Doctor')}>
            Doctor
          </button>
        </div>
      );
    }
    
    const styles = {
      container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f9',
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
