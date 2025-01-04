import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';


function DoctorMain(){
    const navigate = useNavigate(); // Use the hook for navigation
    const handleButtonClick = (action) => {
        if(action === "Add Patient Data"){
            navigate('/add-patient-data')
        }
        console.log(`${action} button clicked`);
        // You can replace the console log with actual functionality
        // for each button based on the app's requirements
    };

    return (
        <div style = {styles.container}>
            <h2>Welcome to the Doctors Hub</h2>
            <p>You are now logged in.</p>
            
            <div style = {styles.buttonContainer}>
                <button
                    onClick={()=> handleButtonClick('Add Patient Data')}
                    style={styles.button}
                >
                    Add Patient Data  
                </button>
                <button
                    onClick={()=> handleButtonClick('Remove Patient Data')}
                    style={styles.button}
                >
                    Remove Patient Data  
                </button>
                <button
                    onClick={()=> handleButtonClick('Update Patient Data')}
                    style={styles.button}
                >
                    Update Patient Data  
                </button>
                <button
                    onClick={()=> handleButtonClick('Predict Patient Data')}
                    style={styles.button}
                >
                    Predict  
                </button>

            </div>

        </div>

    )    
};
const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f4f4f9',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginTop: '20px',
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      backgroundColor: '#007BFF',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      width: '200px',  // Adjust button size
    },
}
export default DoctorMain