import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// Assuming you might use icons from lucide-react or similar
// import { Clock, MoreHorizontal, Truck, BarChart2, ArrowRightLeft } from "lucide-react"; 
import AdminLayout from "../Navbar/AdminLayout";
import "./AdminDashboard.css";

const API_BASE_URL = `https://wms-backend-xdgv.onrender.com/api`; // Updated to correct API URL

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [routesCount, setRoutesCount] = useState(0);
  const [collections, setCollections] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [pickups, setPickups] = useState([]);
  const [error, setError] = useState(null);

  const fetchWithAuth = async (endpoint) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required");
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      setError(error.message);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch routes
        console.log("Fetching routes...");
        const routesData = await fetchWithAuth('/route/get-routes');
        if (routesData?.success) {
          setRoutes(routesData.data.slice(-2).reverse());
          setRoutesCount(routesData.count);
        }

        // Fetch collections
        console.log("Fetching collections...");
        const collectionsData = await fetchWithAuth('/collections');
        if (collectionsData?.success) {
          setCollections(collectionsData.collections);
          const total = collectionsData.collections.reduce((sum, c) => sum + (c.amount || 0), 0);
          setTotalCollected(total);
        }

        // Fetch pickups
        console.log("Fetching pickups...");
        const pickupsData = await fetchWithAuth('/admin/pickups/history');
        if (pickupsData?.pickups) {
          const sorted = [...pickupsData.pickups].sort((a, b) => 
            new Date(b.pickupDateTime) - new Date(a.pickupDateTime)
          );
          setPickups(sorted.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  // Add console logs for state changes
  useEffect(() => {
    console.log("Current state:", {
      routes,
      routesCount,
      collections,
      totalCollected,
      pickups
    });
  }, [routes, routesCount, collections, totalCollected, pickups]);

  return (
    <AdminLayout>
      <div className="dashboard-content">
        {/* Top Row: Routes and Stats */}
        <div className="dashboard-top-row">
          {/* Routes Section */}
          <div className="routes-section card">
            <div className="card-header">
              <h2 className="section-title">Active Route</h2>
            </div>
            
            {routes.map(route => (
              <div className="route-card" key={route._id}>
                <span className="icon-placeholder truck-icon">🚚</span>
                <div className="route-details">
                  <h3>{route.routeId} - {route.routeName}</h3>
                  <p className="route-time">
                    {new Date(route.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`status-badge status-${route.status.toLowerCase()}`}>
                  {route.status}
                </span>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stat-card card">
              <div className="card-header">
                <h3>Waste Collected</h3>
                <span className="icon-placeholder">📊</span>
              </div>
              <p className="stat-value">{totalCollected} kg</p>
            </div>
            
            <div className="stat-card card">
              <div className="card-header">
                <h3>Active Routes</h3>
                <span className="icon-placeholder">⇄</span>
              </div>
              <p className="stat-value">{routesCount}</p>
            </div>
          </div>
        </div>

        {/* Activities Section */}
        <div className="activities-section card">
          <div className="card-header">
            <h2 className="section-title">Recent Activities</h2>
            <Link to="/pickupmanagement" className="view-all-link">
              View All
            </Link>
          </div>
          <div className="activities-table">
            {/* Header Row */}
            <div className="table-row table-header">
              <div className="table-cell">Date</div>
              <div className="table-cell">Location</div>
              <div className="table-cell">Type</div>
              <div className="table-cell">Amount</div>
              <div className="table-cell">Status</div>
            </div>
            
            {/* Data Rows */}
            {pickups.map(pickup => (
              <div className="table-row" key={pickup._id}>
                <div className="table-cell">
                  {new Date(pickup.pickupDateTime).toLocaleString()}
                </div>
                <div className="table-cell">{pickup.address}</div>
                <div className="table-cell">{pickup.wasteType}</div>
                <div className="table-cell">{pickup.amount} {pickup.unit}</div>
                <div className="table-cell">
                  <span className={`status-badge status-${pickup.status.toLowerCase()}`}>
                    {pickup.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
