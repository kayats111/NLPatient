import React, { useState } from 'react';
import './styles.css';


function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRClicked, setIsRClicked] = useState(false);
    const [isDClicked, setIsDClicked] = useState(false);
    const [clickedLabel, setClickedLabel] = useState('');  // Store the label of the clicked button


    const handleSubmit = (event) => {
        event.preventDefault()
        // console.log(email)
        // console.log(password)
        // console.log(clickedLabel)

    };
   
    const handleRClick = (label) => {
        setIsRClicked(!isRClicked);
        setIsDClicked(false);
        setClickedLabel(label); // Set the label of the clicked button

    };
    const handleDClick = (label) => {
        setIsDClicked(!isDClicked);
        setIsRClicked(false);
        setClickedLabel(label); // Set the label of the clicked button

    };

    let buttonClass1 = isDClicked ? 'button' : 'default-style';
    let buttonClass2 = isRClicked ? 'button' : 'default-style';
    return (
        <div className='container'>
            <h2>Sign-Up</h2>
            <form className='form' onSubmit={handleSubmit}>
                <div className='input-group'>
                    <label htmlFor="email">Email:</label>
                    <input type="email" value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                    //   required
                      />
                </div>
                <div className='input-group'>
                    <label htmlFor="Password">Password:</label>
                    <input type="password" value={password}
                      onChange={(e)=>setPassword(e.target.value)}
                    //   required
                      />
                </div>
                <div className="role-container">
                    <span className="label">Role:</span>
                    <div className="button-container">
                        <button type='button' className={buttonClass2}
                            onClick={()=>handleRClick("Researcher")}>
                            Researcher
                        </button>
                        <button type='button' className={buttonClass1}
                            onClick={()=>handleDClick("Doctor")}>
                            Doctor
                        </button>
                    </div>
                </div>
                <button type="submit" className='button'>Sign Up</button>
            </form>
        </div>
    )

}
export default SignUpPage