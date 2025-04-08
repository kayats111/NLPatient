import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // For making API requests
import { useRole } from "./context/roleContext";
import { useUser } from './context/UserContext';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to track the error message
  const navigate = useNavigate(); // Use the hook for navigation
  const { setRole } = useRole(); // Assuming you have a context to handle user role
  const {login} = useUser();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); // clear previous error
  
    try {
      // 1. Check if user is pending approval
      if(email ==="admin@admin.com"){
        navigate("/choicepage")
      }
      const approvalRes = await axios.post("/users/api/user/check_approval", { email });
  
      if (approvalRes.data.value.pending) {
        // 👇 Your custom logic here
        // navigate("/approval-page")
        navigate("/pending_approval")
        // maybe navigate("/waiting-approval") or do something else
        return;
      }
  
      // 2. If not pending, proceed with login
      const loginRes = await axios.post("/users/api/user/login", { email, password });
  
      login(loginRes.data.value);
      setRole(loginRes.data.value.role);
  
      const role = loginRes.data.value.role;
      if (role === "Admin") navigate("/choicepage");
      else if (role === "Researcher") navigate("/researcher-main");
      else if (role === "Doctor") navigate("/doctor-main");
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Invalid email or password");
    }
  };
  

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className='container'>
      <h2>Login</h2>
      <form className='form' onSubmit={handleSubmit}>
        <div className='input-group'>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='input-group'>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className='err-msg'>{error}</p>}
        <button type="submit" className='button'>Login</button>
        <button type="button" className='button' onClick={handleSignUp}>Sign Up</button>
      </form>
    </div>
  );
}

export default Login;
