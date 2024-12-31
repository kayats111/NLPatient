import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';



function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // State to track the error message
    const navigate = useNavigate(); // Use the hook for navigation

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Email:', email);
        console.log('Password:', password);
        if(email === "Hello@gmail.com" || password === "123"){
            setError("ERROR YOU COCK SUCKER-this is just a place holder")
            // console.log("Error set:", "ERROR YOU COCK SUCKER");

        }
        else{
            setError("");
            navigate('/main');
        }

        // Add login logic here
      };

      
    return (
        <div style={styles.container}>
          <h2>Login</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p style={styles.errMsg}>{error}</p>}
            <button type="submit" style={styles.button}>Login</button>
          </form>
        </div>
      );
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
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      width: '300px',
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    input: {
      padding: '10px',
      fontSize: '16px',
      border: '1px solid #ccc',
      borderRadius: '4px',
    },
    button: {
      padding: '10px',
      fontSize: '16px',
      backgroundColor: '#007BFF',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    errMsg: {
        color : "hsl(0, 89.50%, 37.50%)",
        border : "1px solid",
        borderRadius: '5px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '5px',
        backgroundColor: "hsl(0, 26.80%, 86.10%)",

    },
  };
  

export default Login;
