import React from "react";
import Sidebar from "../components/Userdashboard/Navbar/Sidebar";
import Header from "../components/Userdashboard/Navbar/Header.jsx";
import Userschedule from "../components/Userdashboard/Schedule/Userschedule.jsx";
import Footer from "../components/Userdashboard/Navbar/Footer.jsx";

const Schedule = () => {
  return (
    <>
      <Header/>
      <div className="user-schedule">
        <Sidebar />
        <Userschedule/>
        </div>
      <Footer/>
    </>
  );
};


export default Schedule;
