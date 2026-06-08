import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ErrorPopup from "../components/Userdashboard/Navbar/ErrorPopup";

import '../styles/ForgotPassword.css';
import formImage from '../assets/Mail.png';

const ForgotOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  const inputRefs = Array.from({ length: 6 }, () => useRef(null));
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Please fill in all OTP fields.');

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (!/^\d$/.test(value)) {
      e.target.value = '';
      return;
    }

    if (index < inputRefs.length - 1) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleContinue = async () => {
    const otp = inputRefs.map((ref) => ref.current.value).join('');

    if (otp.length !== 6) {
      setErrorMessage('Please fill in all OTP fields.');
      setError(true);
      return;
    }

    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      // ✅ OTP verified → navigate to set password
      navigate('/setpassword', { state: { email, resetToken: data.resetToken } });

    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrorMessage(error.message);
      setError(true);
    }
  };

  const closeErrorPopup = () => {
    setError(false);
  };

  return (
    <div className="forgot-password-container">
      {/* Error Popup */}
      {error && <ErrorPopup message={errorMessage} onClose={closeErrorPopup} />}

      <div className="forms-section">
        <div className="progress-bar-wrapper">
          <h4>Check your mail</h4>
          <div className="progress-bar">
            <div className="progress-filled step2"></div>
          </div>
          <span className="step-label">Step 2/4</span>
        </div>

        <img src={formImage} alt="Mail icon" className="form-image" />

        <h2>Check your mail!</h2>
        <p className="subtitle">
          We sent a 6-digit OTP to <strong>{email}</strong>
        </p>

        <div className="otp-inputs">
          {inputRefs.map((ref, i) => (
            <input
              key={i}
              ref={ref}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              className="otp-box"
              onInput={(e) => handleInput(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            />
          ))}
        </div>

        <button onClick={handleContinue}>Verify OTP</button>
        <a href="/signin" className="back">Back to Sign in</a>
      </div>
    </div>
  );
};

export default ForgotOtp;
