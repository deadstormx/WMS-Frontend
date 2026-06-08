import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Header.css';

import Logo from "../../../assets/Logo.svg";
import Adminlogo from "../../../assets/Adminlogo.svg";
import logout from "../../../assets/logout.png";
import SettingsIcon from "../../../assets/Settings.svg";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [username, setUsername] = useState("Admin");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.fullName) {
          setUsername(parsed.fullName);
        }
      } catch (err) {
        console.error("Failed to parse user:", err);
      }
    }
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const token = localStorage.getItem("token");
    
    try {
      // First make the logout API call
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Only clear localStorage after successful API call
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Navigate to signin page
      navigate("/signin", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if API call fails, clear local data and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/signin", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="header">
      <div className="top-navbar">
        <div className='logo-wrap'>
          <img src={Logo} alt="GreenBin Logo" className="sidebar-logo" />
          <span className="GreenBinText">GreenBin</span>
        </div>
        <div className="profile-container" onClick={toggleDropdown}>
          <img src={Adminlogo} alt="Profile" className="profile-icon" />
          
          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-username">{username}</div>
              <div className="dropdown-item" onClick={handleLogout}>
                <img src={logout} alt="Logout" className="dropdown-icon" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoggingOut && (
        <div className="logout-overlay">
          <div className="logout-animation">
            <span className="loading-spinner"></span>
            <p>Logging out...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;



