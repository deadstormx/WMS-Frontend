import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SuccessPopup from "../components/Userdashboard/Navbar/SuccessPopup";
import ErrorPopup from "../components/Userdashboard/Navbar/ErrorPopup";
import "../styles/signup.css";
import Logo from "../assets/Logo.svg";
import Background from "../assets/Background.png";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });

  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordHints, setPasswordHints] = useState([]);

  const inputRefs = {
    fullName: useRef(null),
    email: useRef(null),
    address: useRef(null),
    phone: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null)
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = (fieldName) => {
    if (!formData[fieldName]) {
      setFocusedField(null);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (name === "password") {
      validatePasswordStrength(value);
      setPasswordError("");
    }

    if (name === "confirmPassword") {
      setPasswordError("");
    }
  };

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

    setPasswordHints(hints);

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    const mediumPasswordRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*\d))|((?=.*[A-Z])(?=.*\d)))[A-Za-z\d@$!%*?#&]{6,}$/;

    if (strongPasswordRegex.test(password)) {
      setPasswordStrength("strong");
    } else if (mediumPasswordRegex.test(password)) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("weak");
    }
  };

  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    return true;
  };

  const registerUser = async (userData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register user");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowErrorPopup(false);
    setShowSuccessPopup(false);
    setPasswordError("");
  
    if (!validatePasswords()) {
      setLoading(false);
      return;
    }
  
    if (!formData.agreedToTerms) {
      setPopupMessage("You must agree to the terms and conditions");
      setShowErrorPopup(true);
      setLoading(false);
      return;
    }
  
    try {
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone, // ✅ fixed key
        address: formData.address,
        password: formData.password,
      };
  
      await registerUser(userData);
      setPopupMessage("Account created successfully! Redirecting...");
      setShowSuccessPopup(true);
  
      setTimeout(() => {
        navigate("/Otpverification", { 
          state: { 
            email: formData.email,
            fullName: formData.fullName,
            phoneNumber: formData.phone,
            password: formData.password,
            address: formData.address
          }
        });
      }, 2000);
    } catch (error) {
      setPopupMessage(error.message || "Registration failed");
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div
      className="signin-container"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="background-container">
        <div className="logoo-wrapperr">
          <img src={Logo} alt="GreenBin Logo" className="logo-img" />
        </div>
        <div className="formm-boxx">
          <h2 className="title">Create your account</h2>
          <p className="subtitle">Join our community today</p>

          <form onSubmit={handleSubmit} className="form">
            {/* Full Name */}
            <div className="inputt-groupp">
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                className="input"
                required
                onFocus={() => handleFocus("fullName")}
                onBlur={() => handleBlur("fullName")}
                ref={inputRefs.fullName}
              />
              <label
                className={`input-label ${focusedField === "fullName" || formData.fullName ? "focused" : ""}`}
                onClick={() => inputRefs.fullName.current.focus()}
              >
                Full Name
              </label>
            </div>

            {/* Email */}
            <div className="inputt-groupp">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
                onFocus={() => handleFocus("email")}
                onBlur={() => handleBlur("email")}
                ref={inputRefs.email}
              />
              <label
                className={`input-label ${focusedField === "email" || formData.email ? "focused" : ""}`}
                onClick={() => inputRefs.email.current.focus()}
              >
                Email
              </label>
            </div>

            {/* Address */}
            <div className="inputt-groupp">
              <input
                type="text"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
                className="input"
                required
                onFocus={() => handleFocus("address")}
                onBlur={() => handleBlur("address")}
                ref={inputRefs.address}
              />
              <label
                className={`input-label ${focusedField === "address" || formData.address ? "focused" : ""}`}
                onClick={() => inputRefs.address.current.focus()}
              >
                Address
              </label>
            </div>

            {/* Phone */}
            <div className="inputt-groupp">
              <input
                type="text"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                required
                onFocus={() => handleFocus("phone")}
                onBlur={() => handleBlur("phone")}
                ref={inputRefs.phone}
              />
              <label
                className={`input-label ${focusedField === "phone" || formData.phone ? "focused" : ""}`}
                onClick={() => inputRefs.phone.current.focus()}
              >
                Phone Number
              </label>
            </div>

            {/* Password */}
            <div className="inputt-groupp">
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                required
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
                ref={inputRefs.password}
              />
              <label
                className={`input-label ${focusedField === "password" || formData.password ? "focused" : ""}`}
                onClick={() => inputRefs.password.current.focus()}
              >
                Password
              </label>

              {focusedField === "password" && (
                <>
                  {passwordStrength && (
                    <div className="password-strength-container">
                      <div className="password-strength-bar">
                        <div className={`bar ${passwordStrength}`}></div>
                      </div>
                      <div className={`strength-text ${passwordStrength}`}>
                        {passwordStrength === "weak" && "Weak Password"}
                        {passwordStrength === "medium" && "Medium Strength"}
                        {passwordStrength === "strong" && "Strong Password"}
                      </div>
                    </div>
                  )}

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
                </>
              )}
            </div>

            {/* Confirm Password */}
            <div className="inputt-groupp">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input"
                required
                onFocus={() => handleFocus("confirmPassword")}
                onBlur={() => handleBlur("confirmPassword")}
                ref={inputRefs.confirmPassword}
              />
              <label
                className={`input-label ${focusedField === "confirmPassword" || formData.confirmPassword ? "focused" : ""}`}
                onClick={() => inputRefs.confirmPassword.current.focus()}
              >
                Confirm Password
              </label>
              {passwordError && (
                <p className="password-error-message">{passwordError}</p>
              )}
            </div>

            {/* Terms and Submit */}
            <div className="checkbox-container">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="checkbox"
                required
              />
              <span>
                I agree to the <a href="/terms" className="terms-link">Terms</a> and <a href="/privacy" className="terms-link">Privacy Policy</a>
              </span>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="signin-text">
            Already have an account? <a href="/signin" className="signin-link">Sign in</a>
          </p>
        </div>
      </div>

      {showSuccessPopup && (
        <SuccessPopup
          message={popupMessage}
          onClose={() => setShowSuccessPopup(false)}
        />
      )}
      {showErrorPopup && (
        <ErrorPopup
          message={popupMessage}
          onClose={() => setShowErrorPopup(false)}
        />
      )}
    </div>
  );
};

export default SignUp;
