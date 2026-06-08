import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 🟢 added useLocation
import '../styles/ForgotPassword.css';
import formImage from '../assets/password.png'; 
import 'font-awesome/css/font-awesome.min.css';
import ErrorPopup from "../components/Userdashboard/Navbar/ErrorPopup";

const SetNewPassword = () => {
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordHints, setPasswordHints] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { email, resetToken } = location.state || {}; // 🟢 get email and resetToken from previous page

  const validatePasswordStrength = (password) => {
    const hints = [];

    if (password.length < 8) {
      hints.push("Use at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      hints.push("Add at least one uppercase letter (A-Z)");
    }
    if (!/[a-z]/.test(password)) {
      hints.push("Add at least one lowercase letter (a-z)");
    }
    if (!/[0-9]/.test(password)) {
      hints.push("Add at least one number (0-9)");
    }
    if (!/[@$!%*?#&]/.test(password)) {
      hints.push("Add at least one special character (@$!%*?#&)");
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    const mediumPasswordRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*\d))|((?=.*[A-Z])(?=.*\d)))[A-Za-z\d@$!%*?#&]{8,}$/;

    let strength = "weak";
    if (strongPasswordRegex.test(password)) {
      strength = "strong";
    } else if (mediumPasswordRegex.test(password)) {
      strength = "medium";
    }

    return { strength, hints };
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const { strength, hints } = validatePasswordStrength(value);
    setPasswordStrength(strength);
    setPasswordHints(hints);
  };

  const handleContinue = async () => {
    if (!email || !resetToken) {
      setErrorMessage("Missing email or reset token. Please restart the password reset process.");
      setShowErrorPopup(true);
      return;
    }

    if (!password) {
      setErrorMessage("Password cannot be empty");
      setShowErrorPopup(true);
      return;
    }

    if (passwordStrength !== 'strong') {
      setErrorMessage("Password is not strong enough. Please meet all requirements.");
      setShowErrorPopup(true);
      return;
    }

    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          resetToken: resetToken,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      // ✅ Password reset successful → navigate
      navigate('/passwordupdate');
    } catch (error) {
      console.error('Error resetting password:', error);
      setErrorMessage(error.message);
      setShowErrorPopup(true);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forms-section">
        <div className="progress-bar-wrapper">
          <h4>Set new password</h4>
          <div className="progress-bar">
            <div className="progress-filled step3"></div>
          </div>
          <span className="step-label">Step 3/4</span>
        </div>

        <img src={formImage} alt="Password icon" className="form-image" />

        <h2>Set new password</h2>
        <p className="subtitle">Must be at least 8 characters</p>

        <label htmlFor="new-password">New Password</label>
        <div className="input-box">
          <span>🔒</span>
          <input
            type={showPassword ? "text" : "password"}
            id="new-password"
            placeholder="Enter new password"
            value={password}
            onChange={handlePasswordChange}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{ cursor: 'pointer' }}
          >
            <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
          </span>
        </div>

        {/* Password strength bar */}
        {password && (
          <div className="password-strength-container">
            <div className={`password-strength-bar ${passwordStrength}`}>
              <div className={`strength-fill ${passwordStrength}`}></div>
            </div>
            <div className={`strength-text ${passwordStrength}`}>
              {passwordStrength === "weak" && "Weak Password"}
              {passwordStrength === "medium" && "Medium Strength"}
              {passwordStrength === "strong" && "Strong Password"}
            </div>
          </div>
        )}

        {/* Hints */}
        {passwordHints.length > 0 && (
          <div className="password-hints">
            <p>To make your password stronger:</p>
            <ul>
              {passwordHints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={handleContinue}>Set new password</button>
        <a href="/signin" className="back">Back to Sign in</a>
      </div>
      
      {showErrorPopup && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => setShowErrorPopup(false)}
        />
      )}
    </div>
  );
};

export default SetNewPassword;

