import React from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorDrawerMenu from './DoctorDrawerMenu'; 
import { useDoctorLinks } from '../Context';

function DoctorMain() {
    const navigate = useNavigate();
    const {links} = useDoctorLinks();
    const updatedLinks = [...links, {name:"Role Page",path:"/choicepage"}]

    const handleButtonClick = (action) => {
        if (action === "Add Patient Data") {
            navigate('/add-patient-data');
        } else if (action === "View Records") {
            navigate('/records-viewer');
        }
    };

    const handlePredictClick = () => {
        navigate("/DPredict");
    };

    return (
        <div style={styles.container}>
            <DoctorDrawerMenu links = {updatedLinks} />

            <h2>Welcome to the Doctors Hub</h2>
            <p>You are now logged in.</p>

            <div style={styles.buttonContainer}>
                <button
                    onClick={() => handleButtonClick('Add Patient Data')}
                    style={styles.button}
                >
                    Add Patient Data
                </button>
                <button
                    onClick={() => handleButtonClick('View Records')}
                    style={styles.button}
                >
                    View Records
                </button>
                <button
                    onClick={() => handlePredictClick()}
                    style={styles.button}
                >
                    Predict
                </button>
            </div>
        </div>
    );
}

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
        width: '200px',
    },
};

export default DoctorMain;
