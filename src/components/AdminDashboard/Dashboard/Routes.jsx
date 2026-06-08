import React, { useState, useEffect } from "react";
import { Search, Edit2, Play, Plus, Trash } from "lucide-react";
import AdminLayout from "../Navbar/AdminLayout";
import "./Routes.css";

const routeData = [
  {
    _id: "68165155176c1e565eca912d",
    routeId: "RT004",
    routeName: "Lubhu/Lalitpur",
    status: "Scheduled",
    createdAt: "2025-05-03T17:24:37.201Z",
  },
  {
    _id: "68163972d1eaef6ae4547ad3",
    routeId: "RT003",
    routeName: "Lubhu/Lalitpur",
    status: "Scheduled",
    createdAt: "2025-05-03T15:42:42.829Z",
  },
  {
    _id: "6815a4458a8352e95c09ecb8",
    routeId: "RT002",
    routeName: "Patan/Lalitpur",
    status: "Scheduled",
    createdAt: "2025-05-03T05:06:13.045Z",
  },
];

const itemsPerPage = 7;

const Routes = () => {
  const [activePage, setActivePage] = useState(1);
  const [search, setSearch] = useState("");
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editForm, setEditForm] = useState({
    routeId: "",
    routeName: "",
    status: ""
  });
  const [createForm, setCreateForm] = useState({
    routeId: "",
    routeName: "",
    status: "No Schedule"
  });

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:3000/api/route/get-routes', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          setError('Session expired. Please login again.');
          setLoading(false);
          return;
        }

        const result = await response.json();
        if (result.success) {
          setRoutes(result.data);
        } else {
          setError(result.message || 'Failed to fetch routes');
        }
      } catch (err) {
        setError('Error fetching routes: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleEdit = (route) => {
    setEditingRoute(route);
    setEditForm({
      routeId: route.routeId,
      routeName: route.routeName,
      status: route.status
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/route/update-route/${editingRoute.routeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newRouteId: editForm.routeId,
          routeName: editForm.routeName,
          status: editForm.status
        })
      });

      const result = await response.json();
      if (result.success) {
        setRoutes(routes.map(route => 
          route.routeId === editingRoute.routeId ? result.data : route
        ));
        setEditingRoute(null);
      } else {
        setError(result.message || 'Failed to update route');
      }
    } catch (err) {
      setError('Error updating route: ' + err.message);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/route/add-route', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      });

      const result = await response.json();
      if (result.success) {
        setRoutes([result.data, ...routes]);
        setShowCreateModal(false);
        setCreateForm({
          routeId: "",
          routeName: "",
          status: "No Schedule"
        });
      } else {
        setError(result.message || 'Failed to create route');
      }
    } catch (err) {
      setError('Error creating route: ' + err.message);
    }
  };

  const handleStartRoute = async (route) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/route/start-route/${route.routeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        const updatedRoutes = routes.map(r => 
          r.routeId === route.routeId ? result.data.route : r
        );
        setRoutes(updatedRoutes);

        setTimeout(async () => {
          try {
            const completeResponse = await fetch(`http://localhost:3000/api/route/update-route/${route.routeId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                routeName: route.routeName,
                status: 'Completed'
              })
            });

            const completeResult = await completeResponse.json();
            if (completeResult.success) {
              setRoutes(prevRoutes => 
                prevRoutes.map(r => 
                  r.routeId === route.routeId ? completeResult.data : r
                )
              );
            } else {
              setError(completeResult.message || 'Failed to complete route');
            }
          } catch (err) {
            setError('Error completing route: ' + err.message);
          }
        }, 5000);
      } else {
        setError(result.message || 'Failed to start route');
      }
    } catch (err) {
      setError('Error starting route: ' + err.message);
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/route/delete-route/${routeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setRoutes(routes.filter(route => route.routeId !== routeId));
      } else {
        setError(result.message || 'Failed to delete route');
      }
    } catch (err) {
      setError('Error deleting route: ' + err.message);
    }
  };

  const filteredRoutes = routes.filter(
    (route) =>
      route.routeId.toLowerCase().includes(search.toLowerCase()) ||
      route.routeName.toLowerCase().includes(search.toLowerCase()) ||
      route.status.toLowerCase().includes(search.toLowerCase())
  );

  const totalEntries = filteredRoutes.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);
  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoutes = filteredRoutes.slice(startIndex, endIndex);
  const showingStart = totalEntries > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(endIndex, totalEntries);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setActivePage(pageNumber);
    }
  };

  const handlePrevious = () => handlePageChange(activePage - 1);
  const handleNext = () => handlePageChange(activePage + 1);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="routes-content card">
        <div className="routes-header">
          <h2 className="routes-title">Routes Management</h2>
          <div className="routes-actions">
            <button className="create-btn" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> Create Route
            </button>
            <div className="search-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search routes..."
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="routes-table-container">
          <div className="table-row table-header">
            <div className="table-cell">Route ID</div>
            <div className="table-cell">Route Name</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Created At</div>
          </div>

          {currentRoutes.length === 0 ? (
            <div className="table-row">
              <div className="table-cell" colSpan={4} style={{ textAlign: 'center' }}>
                No routes found.
              </div>
            </div>
          ) : (
            currentRoutes.map((route) => (
              <div className="table-row" key={route._id}>
                <div className="table-cell">{route.routeId}</div>
                <div className="table-cell">{route.routeName}</div>
                <div className="table-cell">
                  <span className={`status-badge status-${route.status.toLowerCase()}`}>
                    {route.status}
                  </span>
                </div>
                <div className="table-cell">{formatDate(route.createdAt)}</div>
                <div className="table-cell actions-cell">
                  <button className="edit-btn" onClick={() => handleEdit(route)}>
                    <Edit2 size={16} />
                  </button>
                  {route.status === 'Scheduled' && (
                    <button className="start-btn" onClick={() => handleStartRoute(route)}>
                      <Play size={16} />
                    </button>
                  )}
                  <button className="delete-route" onClick={() => handleDeleteRoute(route.routeId)}>
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="routes-pagination">
          <div className="pagination-info">
            Showing {showingStart} to {showingEnd} of {totalEntries} entries
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn prev" onClick={handlePrevious} disabled={activePage === 1}>
              Previous
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                className={`pagination-btn ${activePage === page ? "active" : ""}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button className="pagination-btn next" onClick={handleNext} disabled={activePage === totalPages}>
              Next
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Create New Route</h3>
              <form onSubmit={handleCreateSubmit}>
                <div className="form-group">
                  <label>Route ID</label>
                  <input
                    type="text"
                    value={createForm.routeId}
                    onChange={(e) => setCreateForm({ ...createForm, routeId: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Route Name</label>
                  <input
                    type="text"
                    value={createForm.routeName}
                    onChange={(e) => setCreateForm({ ...createForm, routeName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    required
                  >
                    <option value="No Schedule">No Schedule</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="save-btn">Create Route</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingRoute && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Edit Route</h3>
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label>Route ID</label>
                  <input
                    type="text"
                    value={editForm.routeId}
                    onChange={(e) => setEditForm({ ...editForm, routeId: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Route Name</label>
                  <input
                    type="text"
                    value={editForm.routeName}
                    onChange={(e) => setEditForm({ ...editForm, routeName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    required
                  >
                    <option value="No Schedule">No Schedule</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button type="button" className="cancel-btn" onClick={() => setEditingRoute(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Routes;
