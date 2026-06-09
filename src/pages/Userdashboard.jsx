import React, { useState, useEffect } from "react";
import Sidebar from "../components/Userdashboard/Navbar/Sidebar.jsx";
import Pickup from "../components/Userdashboard/Dashboard/pickup.jsx";
import Recentpickup from "../components/Userdashboard/Dashboard/Recentpickup.jsx";
import Header from "../components/Userdashboard/Navbar/Header.jsx";
import "../components/Userdashboard/Dashboard/Dashboard.css";
import Esewa from "../assets/Esewa.jpg";
import Khalti from "../assets/Khalti.png";
import Imepay from "../assets/Imepay.jpg";
import SuccessPopup from "../components/Userdashboard/Navbar/SuccessPopup";
import ErrorPopup from "../components/Userdashboard/Navbar/ErrorPopup";
import Footer from "../components/Userdashboard/Navbar/Footer.jsx";
import axios from "axios";

const Userdashboard = () => {
  const [recentPickups, setRecentPickups] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [currentPickup, setCurrentPickup] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const [pendingPickupData, setPendingPickupData] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (token && parsedUser?.id) {
        setIsAuthenticated(true);
        setUserId(parsedUser.id);
        return true;
      }
      return false;
    };

    if (!checkAuth()) {
      // If not authenticated, redirect to signin
      window.location.href = '/signin';
    }
  }, []);

  // Function to fetch recent pickups
  const fetchRecentPickups = async () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (!parsedUser?.id || !token) {
      console.warn("Authentication required. Redirecting to signin...");
      window.location.href = '/signin';
      return;
    }

    try {
      const response = await fetch(`https://wms-backend-xdgv.onrender.com/api/pickups/history?userId=${parsedUser.id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        console.warn("Session expired. Redirecting to signin...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = '/signin';
        return;
      }

      const result = await response.json();

      if (result.pickups && Array.isArray(result.pickups)) {
        const transformedData = result.pickups
          .map((pickup) => ({
            date: new Date(pickup.pickupDateTime).toLocaleString(),
            address: pickup.address,
            type: pickup.wasteType.charAt(0).toUpperCase() + pickup.wasteType.slice(1),
            amount: `${pickup.amount} ${pickup.unit}`,
            status: pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1),
            payment: pickup.payment || "",
          }))
          .slice(0, 5);

        setRecentPickups(transformedData);
      } else {
        console.warn("No pickups found in response.");
        setRecentPickups([]);
      }
    } catch (err) {
      console.error("Error fetching recent pickups:", err);
      setRecentPickups([]);
    }
  };

  // Fetch pickups when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentPickups();
    }
  }, [isAuthenticated]);

  // Listen for changes to user data in localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        if (token && parsedUser?.id) {
          setIsAuthenticated(true);
          setUserId(parsedUser.id);
          fetchRecentPickups();
        } else {
          setIsAuthenticated(false);
          setUserId(null);
          window.location.href = '/signin';
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addPickup = (newPickup) => {
    // Store the pickup data and show payment popup
    setPendingPickupData(newPickup);
    setCurrentPickup(newPickup);
    setPopupMessage(
      `New pickup request added successfully!\nSubscription: ${newPickup.subscription}.\nPlease select a payment method.`
    );
    setShowPopup(true);
    setIsPaymentPending(true);
  };

  const handlePaymentSelection = async (paymentMethod) => {
    if (currentPickup && pendingPickupData) {
      try {
        // Submit the pickup request with payment method
        const response = await axios.post(
          `https://wms-backend-xdgv.onrender.com/api/pickups`,
          {
            ...pendingPickupData,
            payment: paymentMethod
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Pickup Scheduled Successfully:", response.data);

        // Update the recent pickups state
        const transformedPickup = {
          date: new Date().toLocaleString(),
          address: pendingPickupData.address,
          type: pendingPickupData.wasteType.charAt(0).toUpperCase() + pendingPickupData.wasteType.slice(1),
          amount: `${pendingPickupData.amount} ${pendingPickupData.unit}`,
          status: "Pending",
          payment: paymentMethod,
        };

        setRecentPickups(prev => [transformedPickup, ...prev].slice(0, 5));
        
        // Reset states
        setShowPopup(false);
        setIsPaymentPending(false);
        setCurrentPickup(null);
        setPendingPickupData(null);
        
        // Show success message
        setPaymentSuccess(true);
        setTimeout(() => setPaymentSuccess(false), 3000);

        // Refresh the pickups list
        await fetchRecentPickups();
      } catch (err) {
        console.error("Error submitting pickup:", err);
        setPaymentError(true);
        setTimeout(() => setPaymentError(false), 3000);
      }
    }
  };

  const handleClosePaymentPopup = () => {
    // Reset all states when popup is closed
    setShowPopup(false);
    setIsPaymentPending(false);
    setCurrentPickup(null);
    setPendingPickupData(null);
  };

  // Add click outside handler for popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPopup && !event.target.closest('.popup-message')) {
        handleClosePaymentPopup();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopup]);

  return (
    <>
      <Header />
      <div className="user-dashboard">
        <Sidebar />
        <div className={`dashboard-wrapper ${showPopup ? "blurred" : ""}`}>
          <Pickup addPickup={addPickup} isPaymentPending={isPaymentPending} />
          <Recentpickup recentPickups={recentPickups} />
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-message">
            <button className="close-button" onClick={handleClosePaymentPopup}>✖</button>
            <p>{popupMessage}</p>
            <div className="payment-options">
              <img className="esewa payment-icon" src={Esewa} alt="Esewa" onClick={() => handlePaymentSelection("Esewa")} />
              <img className="khalti payment-icon" src={Khalti} alt="Khalti" onClick={() => handlePaymentSelection("Khalti")} />
              <img className="imepay payment-icon" src={Imepay} alt="Imepay" onClick={() => handlePaymentSelection("Imepay")} />
            </div>
          </div>
        </div>
      )}

      {paymentSuccess && <SuccessPopup message="Payment successful! Your pickup has been processed." />}
      {paymentError && <ErrorPopup message="Payment failed. Please try again." />}
      <Footer/>
    </>
  );
};

export default Userdashboard;
