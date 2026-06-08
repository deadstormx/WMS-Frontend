import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Otp.css";
import Otpp from "../assets/Otpp.png";

const Otp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your@email.com";
  const fullName = location.state?.fullName || "Test User";
  const phoneNumber = location.state?.phoneNumber || "+1234567890";
  const password = location.state?.password || "password123";
  const address = location.state?.address || "123 Test Street";

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = Array.from({ length: 6 }, () => useRef(null));

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) {
      return;
    }

    const updatedOtp = [...otp];
    updatedOtp[index] = value.slice(-1); // Take only the last character
    setOtp(updatedOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current input is empty and backspace is pressed, move to previous input
        inputRefs[index - 1].current.focus();
        const updatedOtp = [...otp];
        updatedOtp[index - 1] = '';
        setOtp(updatedOtp);
      } else {
        // Clear current input
        const updatedOtp = [...otp];
        updatedOtp[index] = '';
        setOtp(updatedOtp);
      }
    }
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      alert("Please enter the 6-digit OTP.");
      return;
    }

    const payload = {
      email,
      otp: enteredOtp,
      fullName,
      phoneNumber,
      password,
      address,
    };

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/users/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert("OTP verified successfully!");
        navigate("/signin");
      } else {
        alert(result.message || "OTP verification failed.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("An error occurred while verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <img src={Otpp} alt="OTP" className="otp-image" />

      <h2 className="otp-title">OTP Verification</h2>
      <p className="otp-subtitle">
        Enter the OTP sent to <strong>{email}</strong>
      </p>

      <div className="otp-inputs">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="otp-box"
          />
        ))}
      </div>

      <button className="verify-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? "Verifying..." : "Verify & Proceed"}
      </button>
    </div>
  );
};

export default Otp;
