import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import AdminLayout from "../Navbar/AdminLayout";
import "./PickupManagement.css";

const PickupManagement = () => {
  const [activePage, setActivePage] = useState(1);
  const [pickupData, setPickupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 7;

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`https://wms-backend-xdgv.onrender.com/api/admin/pickups/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.pickups) {
        const transformedData = response.data.pickups.map(pickup => ({
          id: pickup._id,
          date: new Date(pickup.pickupDateTime).toLocaleString(),
          location: pickup.address,
          type: pickup.wasteType.charAt(0).toUpperCase() + pickup.wasteType.slice(1),
          user: pickup.userId?.fullName || "Unknown User",
          status: pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1),
          route: pickup.route,
          subscription: pickup.subscription,
          amount: `${pickup.amount} ${pickup.unit}`,
          requestedTime: new Date(pickup.requestedTime).toLocaleString()
        }));
        setPickupData(transformedData);
      }
    } catch (err) {
      console.error("Error fetching pickups:", err);
      setError("Failed to load pickup data");
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search term
  const filteredData = pickupData.filter(pickup => 
    pickup.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination details
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);
  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPickupData = filteredData.slice(startIndex, endIndex);
  const showingStart = totalEntries > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(endIndex, totalEntries);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setActivePage(pageNumber);
    }
  };

  const handlePrevious = () => {
    handlePageChange(activePage - 1);
  };

  const handleNext = () => {
    handlePageChange(activePage + 1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of visible pages
      let start = Math.max(2, activePage - 1);
      let end = Math.min(totalPages - 1, activePage + 1);
      
      // Adjust if at the start
      if (activePage <= 2) {
        end = Math.min(totalPages - 1, maxVisiblePages - 1);
      }
      // Adjust if at the end
      if (activePage >= totalPages - 1) {
        start = Math.max(2, totalPages - maxVisiblePages + 2);
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <AdminLayout>
      <div className="pickup-content card">
        {/* Header: Title and Search */}
        <div className="pickup-header">
          <h2 className="pickup-title">Pickup Management</h2>
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search pickups..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setActivePage(1); // Reset to first page on search
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="pickup-table-container">
          {/* Header Row */}
          <div className="table-row table-header">
            <div className="table-cell">Date</div>
            <div className="table-cell">Location</div>
            <div className="table-cell">Route</div>
            <div className="table-cell">Type</div>
            <div className="table-cell">Amount</div>
            <div className="table-cell">User</div>
            <div className="table-cell">Status</div>
          </div>
          
          {/* Data Rows */}
          {currentPickupData.length > 0 ? (
            currentPickupData.map((pickup) => (
              <div className="table-row" key={pickup.id}>
                <div className="table-cell">{pickup.date}</div>
                <div className="table-cell">{pickup.location}</div>
                <div className="table-cell">{pickup.route}</div>
                <div className="table-cell">{pickup.type}</div>
                <div className="table-cell">{pickup.amount}</div>
                <div className="table-cell">{pickup.user}</div>
                <div className="table-cell">
                  <span className={`status-badge status-${pickup.status.toLowerCase()}`}>
                    {pickup.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="table-row">
              <div className="table-cell no-data" colSpan="7">
                No pickups found
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalEntries > 0 && (
          <div className="pickup-pagination">
            <div className="pagination-info">
              Showing {showingStart} to {showingEnd} of {totalEntries} entries
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-btn prev" 
                onClick={handlePrevious} 
                disabled={activePage === 1}
              >
                Previous
              </button>
              
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={page}
                    className={`pagination-btn ${activePage === page ? "active" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button 
                className="pagination-btn next" 
                onClick={handleNext} 
                disabled={activePage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PickupManagement;
