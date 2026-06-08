import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../styles/ForgotPassword.css';
import formImage from '../assets/forgotpassword.jpg';
import ErrorPopup from "../components/Userdashboard/Navbar/ErrorPopup";

const ForgotPassword = () => {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // to store dynamic error message

  const handleContinue = async () => {
    if (!email.trim()) {  
      setErrorMessage("Please enter your email!");
      setShowError(true);
      return; 
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      // ✅ API success → navigate to OTP page
      navigate('/forgototp', { state: { email } });

    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrorMessage(error.message);
      setShowError(true);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forms-section">
        <div className="progress-bar-wrapper">
          <h4>Forgot Password</h4>
          <div className="progress-bar">
            <div className="progress-filled"></div>
          </div>
          <span className="step-label">Step 1/4</span>
        </div>

        <img src={formImage} alt="Progress" className="form-image" />

        <h2>Forgot Password</h2>
        <p className="subtitle">No Worries, we'll handle it.</p>

        <label htmlFor="email">Gmail</label>
        <div className="input-box">
          <span>📧</span>
          <input
            type="email"
            id="email"
            placeholder="mario@phamatin.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button onClick={handleContinue}>Continue</button>
        <a href="/signin" className="back">Back to Sign in</a>
      </div>

      {showError && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}
    </div>
  );
};

export default ForgotPassword;
