import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import './styles.css';
import {useRole} from "./context/roleContext";


function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // State to track the error message
    const navigate = useNavigate(); // Use the hook for navigation
    const {role} = useRole();
    const handleSubmit = (event) => {
        if (role === "admin"){
          navigate('/choicepage'); // TODO DELETE THIS
        }
        else if (role ==="researcher"){
          navigate('/researcher-main');
        }
        else if (role === "doctor"){
          navigate('/doctor-main');
        }
        event.preventDefault();
        // console.log('Email:', email);
        // console.log('Password:', password);
        if(email === "Hello@gmail.com" || password === "123"){
            setError("ERROR YOU COCK SUCKER-this is just a place holder")
            // console.log("Error set:", "ERROR YOU COCK SUCKER");

        }
        else{
            setError("");
            // navigate('/main');
        }

        // Add login logic here
      };
      const handleSignUp = (event)=>{
        navigate('/signup')
      };
      
    return (
        <div className='container'>
          <h2>Login</h2>
          <form className='form' onSubmit={handleSubmit} >
            <div className='input-group'>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // required
              />
            </div>
            <div className='input-group'>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // required
              />
            </div>
            {error && <p className='err-msg'>{error}</p>}
            <button type="submit" className='button'>Login</button>
            <button type="button" className='button' onClick={handleSignUp} >Sign Up</button>
          </form>
        </div>
      );
};

  

export default Login;
