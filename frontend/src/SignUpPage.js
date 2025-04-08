import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import './SignUpPage.css'; // Custom CSS for styling

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRClicked, setIsRClicked] = useState(false);
  const [isDClicked, setIsDClicked] = useState(false);
  const [isAdminClicked, setIsAdminClicked] = useState(false);
  const [clickedLabel, setClickedLabel] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const checkIfUserExists = async (email) => {
    try {
      const response = await axios.post("http://localhost:3004/api/user/check_approval", { "email":email });
      if (response.data.value["pending"]) {
        setErrorMessage("This email is currently pending approval.");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking user approval:", error);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const role = clickedLabel;
    const payload = {
      username: email.split('@')[0],
      email,
      password,
      role
    };
    // Check if the user is pending approval
    const isPending = await checkIfUserExists(email);

    if (isPending) {
        alert("Have some patience you handsome Non-Binary individual");
        return;
    }
    try {
      const response = await axios.post("http://localhost:3004/api/user/register", payload);
      const data = response.data.value;

      if (!response.data.error) {
        alert("User registered successfully!");
        navigate("/");
        // console.log("Server response:", data);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("An error occurred while signing up.");
      console.error("Signup error:", error);
    }
  };

  const handleRClick = (label) => {
    setIsRClicked(!isRClicked);
    setIsDClicked(false);
    setIsAdminClicked(false);
    setClickedLabel(label);
  };

  const handleDClick = (label) => {
    setIsDClicked(!isDClicked);
    setIsRClicked(false);
    setIsAdminClicked(false);
    setClickedLabel(label);
  };

  const handleAdminClick = (label) => {
    setIsAdminClicked(!isAdminClicked);
    setIsDClicked(false);
    setIsRClicked(false);
    setClickedLabel(label);
  };

  const buttonClass1 = isDClicked ? 'choice-button' : 'choice-default-style';
  const buttonClass2 = isRClicked ? 'choice-button' : 'choice-default-style';
  const buttonClass3 = isAdminClicked ? 'choice-button' : 'choice-default-style';

  return (
    <div className='container'>
      <h2>Sign-Up</h2>
      <form className='form' onSubmit={handleSubmit}>
        <div className='input-group'>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='input-group'>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="choice-role-container">
            <span className="choice-label">Role:</span>
            <div className="choice-button-container">
                <div className="top-buttons">
                <button type="button" className={buttonClass2} onClick={() => handleRClick("Researcher")}>
                    Researcher
                </button>
                <button type="button" className={buttonClass1} onClick={() => handleDClick("Doctor")}>
                    Doctor
                </button>
                </div>
                <div className="admin-button">
                <button type="button" className={buttonClass3} onClick={() => handleAdminClick("Admin")}>
                    Admin
                </button>
                </div>
            </div>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit" className='button'>Sign Up</button>
      </form>
    </div>
  );
}

export default SignUpPage;
