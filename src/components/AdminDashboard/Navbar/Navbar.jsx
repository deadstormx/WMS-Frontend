import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../../Userdashboard/Navbar/Sidebar.css";
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
            <NavLink to="/admindashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              <img src={Dashboard} alt="Dashboard" className="icon" />
              <span className="text">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/collection" className={({ isActive }) => (isActive ? "active" : "")}>
              <img src={Schedule} alt="Collection" className="icon" />
              <span className="text">Collection</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/pickupmanagement" className={({ isActive }) => (isActive ? "active" : "")}>
              <img src={Schedule} alt="All Pickup" className="icon" />
              <span className="text">All Pickup</span>
            </NavLink>
          </li>
        </ul>
      </div>
  );
};

export default Sidebar;

