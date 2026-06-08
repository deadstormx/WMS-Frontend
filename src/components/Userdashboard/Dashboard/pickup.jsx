import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Pickup.css";

const Pickup = ({ addPickup, isPaymentPending }) => {
  const [formData, setFormData] = useState({
    address: '',
    dateTime: '',
    subscription: '1 Day (Rs.500)',
    wasteType: '',
    route: '',
    amount: '',
    unit: 'kg'
  });

  const [routes, setRoutes] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRoutes();
    fetchWasteTypes();
    // Get user's address from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.address) {
          setFormData(prev => ({
            ...prev,
            address: parsedUser.address
          }));
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/route/get-routes", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setRoutes(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch routes", err);
    }
  };

  const fetchWasteTypes = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/collections", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        const types = [...new Set(response.data.collections.map(col => col.type))];
        setWasteTypes(types);
        setFormData(prev => ({ ...prev, wasteType: types[0] || '' }));
      }
    } catch (err) {
      console.error("Failed to fetch waste types", err);
    }
  };

  const validateDateTime = (date) => {
    // Convert to Nepal time (UTC+5:45)
    const nepalOffset = 5.75 * 60 * 60 * 1000; // 5 hours and 45 minutes in milliseconds
    const nepalDate = new Date(date.getTime() + nepalOffset);
    const hours = nepalDate.getUTCHours();
    const minutes = nepalDate.getUTCMinutes();

    // Check if time is between 5 AM and 11:59 PM
    if (hours < 5) {
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dateTime") {
      const selectedDate = new Date(value);
      const currentDate = new Date();
      
      if (selectedDate < currentDate) {
        setError("Cannot select a past date and time");
        return;
      }
      
      // Convert to Nepal time (UTC+5:45)
      const nepalOffset = 5.75 * 60 * 60 * 1000; // 5 hours and 45 minutes in milliseconds
      const nepalDate = new Date(selectedDate.getTime() + nepalOffset);
      const hours = nepalDate.getUTCHours();
      
      if (hours < 5) {
        setError("Pickup time must be between 5 AM and 11:59 PM (Nepal time)");
        return;
      }
      
      // Clear error message if time is valid
      setError('');
    }

    if (name === "unit") {
      setFormData(prev => {
        const currentAmount = parseFloat(prev.amount);
        if (!isNaN(currentAmount)) {
          let newAmount = currentAmount;
          if (value === "g" && prev.unit === "kg") {
            newAmount = currentAmount * 1000;
          } else if (value === "kg" && prev.unit === "g" && currentAmount >= 1000) {
            newAmount = currentAmount / 1000;
          }
          return { ...prev, unit: value, amount: newAmount.toString() };
        }
        return { ...prev, unit: value };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAmountConversion = () => {
    setFormData(prev => {
      const amt = parseFloat(prev.amount);
      if (prev.unit === "g" && amt >= 1000) {
        return {
          ...prev,
          amount: (amt / 1000).toString(),
          unit: "kg"
        };
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if payment is pending
    if (isPaymentPending) {
      setError("Please complete or cancel the pending payment first.");
      return;
    }

    setError('');

    const { address, dateTime, subscription, wasteType, route, amount, unit } = formData;

    if (!address || !dateTime || !amount || !wasteType || !route) {
      setError("All fields are required.");
      return;
    }

    if (isNaN(Number(amount))) {
      setError("Amount must be a number.");
      return;
    }

    let adjustedAmount = Number(amount);
    let adjustedUnit = unit;
    if (unit === 'g' && adjustedAmount >= 1000) {
      adjustedAmount = adjustedAmount / 1000;
      adjustedUnit = 'kg';
    }

    // Create a new Date object from the input datetime
    const selectedDateTime = new Date(dateTime);
    
    // Validate the time using Nepal time
    if (!validateDateTime(selectedDateTime)) {
      setError("Pickup time must be between 5 AM and 11:59 PM");
      return;
    }

    // Format the date to ISO string with UTC timezone
    const formattedDateTime = selectedDateTime.toISOString();

    const payload = {
      address,
      pickupDateTime: formattedDateTime,
      subscription,
      wasteType: wasteType.toLowerCase(),
      route,
      amount: adjustedAmount,
      unit: adjustedUnit
    };

    // Pass the payload to parent component and reset form
    addPickup(payload);
    setFormData({
      address: '',
      dateTime: '',
      subscription: '1 Day (Rs.500)',
      wasteType: wasteTypes[0] || '',
      route: '',
      amount: '',
      unit: 'kg'
    });
  };

  return (
    <div className="pickup-containerr">
      <h2 className='Maintext'>New Pickup Request</h2>
      <p className='subtext'>Schedule a new waste collection</p>

      {error && <p className="error-message">{error}</p>}
      {isPaymentPending && (
        <p className="error-message" style={{ color: '#ff9800' }}>
          Please complete or cancel the pending payment before scheduling a new pickup.
        </p>
      )}

      <form className="pickup-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Pickup Date & Time</label>
          <div className="popup-fields">
            <input
              type="datetime-local"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              className="pickup-input"
              min={new Date().toISOString().slice(0, 16)}
              required
            />
            <small className="time-hint">Pickup time must be between 5 AM and 11:59 PM (Nepal time)</small>
            {error && <small className="error-message">{error}</small>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter pickup address"
            className="pickup-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Route</label>
          <select
            name="route"
            value={formData.route}
            onChange={handleChange}
            className="pickup-select"
            required
          >
            <option value="">Select a route</option>
            {routes.map(route => (
              <option key={route._id} value={route.routeName}>
                {route.routeName} ({route.routeId})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Subscription</label>
          <select
            name="subscription"
            value={formData.subscription}
            onChange={handleChange}
            className="pickup-select"
            required
          >
            <option value="1 Day (Rs.500)">1 Day (Rs.500)</option>
            <option value="1 Month (Rs.5000)">1 Month (Rs.5000)</option>
            <option value="1 Year (Rs.50000)">1 Year (Rs.50000)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Waste Type</label>
          <select
            name="wasteType"
            value={formData.wasteType}
            onChange={handleChange}
            className="pickup-select"
            required
          >
            <option value="">Select waste type</option>
            {wasteTypes.map((type, idx) => (
              <option key={idx} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Waste Weight</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAmountConversion();
            }}
            onBlur={handleAmountConversion}
            placeholder="Enter waste weight"
            className="pickup-input"
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Unit</label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="pickup-select"
            required
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="pickup-button"
          disabled={isPaymentPending}
          style={{ opacity: isPaymentPending ? 0.6 : 1 }}
        >
          {isPaymentPending ? 'Payment Pending...' : 'Schedule Pickup'}
        </button>
      </form>
    </div>
  );
};

export default Pickup;
