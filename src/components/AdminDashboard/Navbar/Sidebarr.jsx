import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebarr.css";
import DashboardIcon from "../../../assets/Dashboard.svg";
import ScheduleIcon from "../../../assets/Schedule.svg";
import RecycleIcon from "../../../assets/Recycle.svg";
import AdminlogoIcon from "../../../assets/Adminlogo.svg";
import CollectionIcon from '../../../assets/Collection.png';
import RouteIcon from '../../../assets/Route.png';

const Sidebarr = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".sidebar__profile-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <nav className="sidebarr">
      <ul className="sidebar__menu">
        <li className="sidebar__menu-item">
          <NavLink 
            to="/admindashboard" 
            className={({ isActive }) => `sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
          >
            <img src={DashboardIcon} alt="Dashboard" className="sidebar__icon" />
            <span className="sidebar__text">Dashboard</span>
          </NavLink>
        </li>
        <li className="sidebar__menu-item">
          <NavLink
            to="/collection"
            className={({ isActive }) => `sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
          >
            <img src={CollectionIcon} alt="Collection" className="sidebar__icon" />
            <span className="sidebar__text">Collection</span>
          </NavLink>
        </li>
        <li className="sidebar__menu-item">
          <NavLink 
            to="/pickupmanagement" 
            className={({ isActive }) => `sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
          >
            <img src={ScheduleIcon} alt="Pickup Management" className="sidebar__icon" />
            <span className="sidebar__text">All Pickup</span>
          </NavLink>
        </li>
        <li className="sidebar__menu-item">
          <NavLink
            to="/routes"
            className={({ isActive }) => `sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
          >
            <img src={RouteIcon} alt="Routes" className="sidebar__icon" />
            <span className="sidebar__text">Routes</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebarr;