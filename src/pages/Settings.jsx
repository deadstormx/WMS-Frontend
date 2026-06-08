import React from "react";
import Sidebar from "../components/Userdashboard/Navbar/Sidebar";
import Header from "../components/Userdashboard/Navbar/Header.jsx";
import UserSettings from "../components/Userdashboard/Settings/UserSettings.jsx";
import  "../components/Userdashboard/Settings/UserSettings.css";
import Footer from "../components/Userdashboard/Navbar/Footer.jsx";

const Settings = () => {
  return(
    <>
    <div className="settings-page">
      <Header/>
      <div className="settings-layout">
        <Sidebar />
        <main className="settings-main-content">
          <UserSettings/>
        </main>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Settings;