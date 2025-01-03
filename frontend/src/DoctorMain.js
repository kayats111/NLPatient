import React from 'react';

function DoctorMain(){
    const handleButtonClick = (action) => {
        console.log(`${action} button clicked`);
        // You can replace the console log with actual functionality
        // for each button based on the app's requirements
    };

    return (
        <div style = {StyleSheet.container}>
            <h2>Welcome to the Doctors Hub</h2>
            <p>You are now logged in.</p>
            
            <div style = {StyleSheet.buttonContainer}>
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
                    Predict Patient Data  
                </button>

            </div>

        </div>

    )
}