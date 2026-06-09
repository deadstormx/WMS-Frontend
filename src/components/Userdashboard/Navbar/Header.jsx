import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Sidebar.css";

import Logo from "../../../assets/Logo.svg";
import logout from "../../../assets/logout.png";
import SettingsIcon from "../../../assets/Settings.svg";
import Adminlogo from "../../../assets/Adminlogo.svg"; 

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [avatar, setAvatar] = useState(Adminlogo); 
  const [username, setUsername] = useState("User");
  const [greeting, setGreeting] = useState("");
  const navigate = useNavigate();

  // Separate useEffect for initial user data and greeting
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.fullName) {
          setUsername(parsed.fullName);
        }
        if (parsed.avatar?.url) {
          setAvatar(parsed.avatar.url);
        }
      } catch (err) {
        console.error("Failed to parse user:", err);
      }
    }

    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []); // Empty dependency array for initial setup only

  // Separate useEffect for storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.avatar?.url && parsed.avatar.url !== avatar) {
            setAvatar(parsed.avatar.url);
          }
          if (parsed?.fullName && parsed.fullName !== username) {
            setUsername(parsed.fullName);
          }
        } catch (err) {
          console.error("Failed to parse user data from storage event:", err);
        }
      }
    };

    // Only add the event listener
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [avatar, username]); // Add dependencies to prevent unnecessary updates

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  const handleLogout = async () => {
    setIsLoggingOut(true);
    const token = localStorage.getItem("token");
  
    try {
      // First make the logout API call
      await axios.post(`https://wms-backend-xdgv.onrender.com/api/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // Clear localStorage and navigate only after API call completes
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Use replace: true to prevent back navigation
      navigate("/signin", { replace: true });
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
        <div className="logo-wrap">
          <img src={Logo} alt="GreenBin Logo" className="sidebar-logo" />
          <span className="GreenBinText">GreenBin</span>
        </div>
        <div className="greeting">
          <span>👋 {greeting}, {username}</span>
        </div>

        {/* Profile Dropdown */}
        <div className="profile-container" onClick={toggleDropdown}>
          <img src={avatar} alt="Profile" className="profile-icon" />

          {showDropdown && (
            <div className="dropdownn-menuu">
              <div className="dropdown-username">{username}</div>
              <NavLink to="/settings" className="dropdown-item">
                <img src={SettingsIcon} alt="Settings" className="dropdown-icon" />
                Settings
              </NavLink>
              <div className="dropdown-item" onClick={handleLogout}>
                <img src={logout} alt="Logout" className="dropdown-icon" />
                Logout
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
