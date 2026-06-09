import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Userschedule.css";
import SuccessPopup from "../Navbar/SuccessPopup";
import ErrorPopup from "../Navbar/ErrorPopup";
import { FaEdit, FaTimes } from "react-icons/fa";

const Userschedule = () => {
  const [data, setData] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState({});
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [routes, setRoutes] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRoutes();
    fetchWasteTypes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await axios.get(`https://wms-backend-xdgv.onrender.com/api/route/get-routes`, {
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
      const response = await axios.get(`https://wms-backend-xdgv.onrender.com/api/collections`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        const types = [...new Set(response.data.collections.map(col => col.type))];
        setWasteTypes(types);
      }
    } catch (err) {
      console.error("Failed to fetch waste types", err);
    }
  };

  useEffect(() => {
    const fetchPickupsHistory = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        if (parsedUser?.id && token) {
          const response = await fetch(`https://wms-backend-xdgv.onrender.com/api/pickups/history?userId=${parsedUser.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          const result = await response.json();

          if (result.pickups) {
            const transformedData = result.pickups.map((pickup) => {
              return {
                id: pickup._id,
                date: pickup.pickupDateTime,
                location: pickup.address,
                route: pickup.route || "-",
                type: pickup.wasteType.charAt(0).toUpperCase() + pickup.wasteType.slice(1),
                amount: `${pickup.amount} ${pickup.unit}`,
                status: pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1),
                subscription: pickup.subscription,
              };
            });
            setData(transformedData);
          } else {
            showError("Failed to load pickup history.");
          }
        } else {
          showError("User not found or not authenticated.");
        }
      } catch (err) {
        console.error(err);
        showError("An error occurred while fetching the data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPickupsHistory();
  }, [token]);

  const handleEdit = (item) => {
    const utcDate = new Date(item.date);
    const nepalDate = new Date(utcDate.getTime() + (5.75 * 60 * 60 * 1000));
    const localDateTime = nepalDate.toISOString().slice(0, 16);

    const now = new Date();
    const nepalNow = new Date(now.getTime() + (5.75 * 60 * 60 * 1000));
    const minDateTime = nepalNow.toISOString().slice(0, 16);

    setEditItem(item.id);
    setEditData({
      date: localDateTime,
      minDate: minDateTime,
      location: item.location,
      route: item.route,
      type: item.type,
      amount: item.amount.split(' ')[0],
      unit: item.amount.split(' ')[1],
      subscription: item.subscription
    });
    setMenuOpen(null);

    setTimeout(() => {
      document.body.classList.add("blur-active");
      document.querySelector('.edit-popup').classList.add('active');
      document.querySelector('.overlay').style.display = 'block';
    }, 0);
  };

  const validateDateTime = (dateTimeString) => {
    try {
      const [datePart, timePart] = dateTimeString.split('T');
      const [hours] = timePart.split(':').map(Number);
      return hours >= 5;
    } catch (error) {
      console.error("Error in validateDateTime:", error);
      return false;
    }
  };

  const handleSaveEdit = async () => {
    if (!editData.date || !editData.location || !editData.route || !editData.type || !editData.amount) {
      showError("All fields are required.");
      return;
    }

    if (!validateDateTime(editData.date)) {
      showError("Pickup time must be between 5 AM and 11:59 PM (Nepal time)");
      return;
    }

    try {
      // Manual conversion from Nepal time to UTC
      const [datePart, timePart] = editData.date.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);
      const nepalDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const utcDate = new Date(nepalDate.getTime() - (5.75 * 60 * 60 * 1000));
      const formattedDateTime = utcDate.toISOString();

      const payload = {
        address: editData.location,
        route: editData.route,
        pickupDateTime: formattedDateTime,
        subscription: editData.subscription,
        wasteType: editData.type.toLowerCase().replace("-", " "),
        amount: parseFloat(editData.amount),
        unit: editData.unit
      };

      const response = await fetch(`https://wms-backend-xdgv.onrender.com/api/pickups/${editItem}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        const updatedItem = {
          id: editItem,
          date: formattedDateTime,
          location: payload.address,
          route: payload.route,
          type: payload.wasteType.charAt(0).toUpperCase() + payload.wasteType.slice(1),
          amount: `${payload.amount} ${payload.unit}`,
          status: "Pending",
          subscription: payload.subscription,
        };

        setData(data.map(item => item.id === editItem ? updatedItem : item));
        showSuccess("Edited Successfully!");
        setEditItem(null);
        document.body.classList.remove("blur-active");
        document.querySelector('.edit-popup').classList.remove('active');
        document.querySelector('.overlay').style.display = 'none';
      } else {
        showError(result.message || "Failed to update data.");
      }
    } catch (error) {
      console.error("Error in handleSaveEdit:", error);
      showError("Error processing date and time");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://wms-backend-xdgv.onrender.com/api/pickups/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setData(data.filter((item) => item.id !== id));
        setMenuOpen(null);
        showSuccess("Cancelled Successfully!");
      } else {
        showError(result.message || "Failed to cancel entry.");
      }
    } catch (error) {
      showError("Error canceling the entry.");
    }
  };

  const showSuccess = (message) => {
    setPopupMessage(message);
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 2000);
  };

  const showError = (message) => {
    setPopupMessage(message);
    setShowErrorPopup(true);
    setTimeout(() => setShowErrorPopup(false), 2000);
  };

  const closeEditPopup = () => {
    setEditItem(null);
    document.body.classList.remove("blur-active");
    document.querySelector('.edit-popup').classList.remove('active');
    document.querySelector('.overlay').style.display = 'none';
  };

  const formatDateTime = (dateString) => {
    try {
      const utcDate = new Date(dateString);
      const nepalDate = new Date(utcDate.getTime() + (5.75 * 60 * 60 * 1000));
      const year = nepalDate.getUTCFullYear();
      const month = String(nepalDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(nepalDate.getUTCDate()).padStart(2, '0');
      let hours = nepalDate.getUTCHours();
      const minutes = String(nepalDate.getUTCMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      hours = String(hours).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const filteredData = data.filter((row) => {
    const typeNormalized = row.type.toLowerCase().replace(/\s|-/g, '');
    const filterNormalized = filterType.toLowerCase().replace(/\s|-/g, '');
    return (
      (filterType === "All" || typeNormalized === filterNormalized) &&
      (row.location.toLowerCase().includes(search.toLowerCase()) ||
        row.route.toLowerCase().includes(search.toLowerCase()) ||
        row.type.toLowerCase().includes(search.toLowerCase()) ||
        row.status.toLowerCase().includes(search.toLowerCase()) ||
        row.amount.toLowerCase().includes(search.toLowerCase()) ||
        row.date.toLowerCase().includes(search.toLowerCase()))
    );
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className={`container ${editItem !== null ? "blur-background" : ""}`}>
      <h2 className="title">Waste Collection Schedule</h2>

      <div className="controls">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-dropdown">
          <option value="All">All Types</option>
          <option value="Organic">Organic</option>
          <option value="Recyclable">Recyclable</option>
          <option value="Non-Recyclable">Non-Recyclable</option>
        </select>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Location</th>
            <th>Route</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr key={row.id}>
              <td>{formatDateTime(row.date)}</td>
              <td>{row.location}</td>
              <td>{row.route}</td>
              <td><span className="type-badge">{row.type}</span></td>
              <td>{row.amount}</td>
              <td className="status-container">
                <span className={row.status === "Pending" ? "status-pending" : "status-completed"}>{row.status}</span>
                <button className="menu-btns" onClick={() => setMenuOpen(menuOpen === row.id ? null : row.id)}>⋮</button>
                {menuOpen === row.id && (
                  <div className="dropdown-menu">
                    <button className="optionss" onClick={() => handleEdit(row)}>
                      <FaEdit style={{ marginRight: "6px" }} /> Edit
                    </button>
                    <button className="optionss" onClick={() => handleDelete(row.id)}>
                      <FaTimes style={{ marginRight: "6px" }} /> Cancel
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editItem !== null && <div className="overlay" onClick={closeEditPopup}></div>}

      {editItem !== null && (
        <div className="edit-popup">
          <h3>Edit Entry</h3>

          <div className="popup-fields">
            <label>Date & Time</label>
            <input
              type="datetime-local"
              value={editData.date}
              min={editData.minDate}
              onChange={(e) => setEditData({ ...editData, date: e.target.value })}
            />
            <small className="time-hint">Pickup time must be between 5 AM and 11:59 PM (Nepal time)</small>
          </div>

          <div className="popup-fields">
            <label>Location</label>
            <input
              type="text"
              value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
            />
          </div>

          <div className="popup-fields">
            <label>Route</label>
            <select
              value={editData.route}
              onChange={(e) => setEditData({ ...editData, route: e.target.value })}
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

          <div className="popup-fields">
            <label>Type</label>
            <select
              value={editData.type}
              onChange={(e) => setEditData({ ...editData, type: e.target.value })}
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

          <div className="popup-fields">
            <label>Amount</label>
            <input
              type="number"
              value={editData.amount}
              onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
              placeholder="Amount"
              min="1"
              required
            />
            <select 
              value={editData.unit} 
              onChange={(e) => setEditData({ ...editData, unit: e.target.value })}
              required
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
            </select>
          </div>

          <div className="popup-actions">
            <button onClick={handleSaveEdit}>Save</button>
            <button onClick={closeEditPopup}>Close</button>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <SuccessPopup message={popupMessage} onClose={() => setShowSuccessPopup(false)} />
      )}
      {showErrorPopup && (
        <ErrorPopup message={popupMessage} onClose={() => setShowErrorPopup(false)} />
      )}
    </div>
  );
};

export default Userschedule;
