import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import Dashboard from "../../../assets/Dashboard.svg";
import Schedule from "../../../assets/Schedule.svg";
import Settings from "../../../assets/Settings.svg";


const Sidebar = () => {
  const [showDropdown, setShowDropdown] = useState(false);


  // Close dropdown when clicking outside
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

      <div className="sidebar">
        <ul>
          <li>
            <NavLink to="/userdashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              <img src={Dashboard} alt="Dashboard" className="icon" />
              <span className="text">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/schedule" className={({ isActive }) => (isActive ? "active" : "")}>
              <img src={Schedule} alt="Schedule" className="icon" />
              <span className="text">Schedule</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>
              <img src={Settings} alt="Settings" className="icon" />
              <span className="text">Settings</span>
            </NavLink>
          </li>
        </ul>
      </div>
  );
};

export default Sidebar;

