import React, { useState, useEffect } from 'react';
import AdminLayout from '../Navbar/AdminLayout';
import './Collection.css';

const Collection = () => {
  const [showModal, setShowModal] = useState(false);
  const [newCollection, setNewCollection] = useState({
    type: '',
    amount: '',
    notes: '',
    status: 'pending',
    route: ''
  });
  const [routes, setRoutes] = useState([]);
  const [collections, setCollections] = useState([]);
  const [editingCollection, setEditingCollection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    notes: '',
    collectionDate: ''
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
      setError("Please log in to access this page.");
    } else if (user.email !== "greenbinpvtltd@gmail.com") {
      setError("Admin access required. Please log in as admin.");
    } else {
      fetchCollections();
    }
  }, []);

  const fetchCollections = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/collections', {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCollections(data.collections || []);
        setError('');
      } else {
        setError(data.message || 'Failed to load collections');
      }
    } catch (err) {
      setError('Failed to fetch collections');
    }
    setLoading(false);
  };

  const openEditModal = (collection) => {
    setEditingCollection(collection);
    setFormData({
      type: collection.type,
      amount: collection.amount,
      notes: collection.notes,
      collectionDate: new Date(collection.createdAt).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingCollection(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({ type: '', amount: '', notes: '', collectionDate: today });
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || !user.id) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/collections`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
          userId: user.id
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Create failed');

      setShowModal(false);
      setEditingCollection(null);
      fetchCollections();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !editingCollection) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/collections/${editingCollection._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount)
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Update failed');

      setShowModal(false);
      setEditingCollection(null);
      fetchCollections();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token || !editingCollection) return;

    try {
      const res = await fetch(`http://localhost:3000/api/collections/${editingCollection._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Delete failed');

      setShowModal(false);
      setEditingCollection(null);
      fetchCollections();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredCollections = collections.filter(collection =>
    collection.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="collection-content">
        <div className="collection-top-row">
          <div className="collection-search-bar">
            <input
              type="text"
              placeholder="Search collections..."
              className="collection-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="collection-search-icon">🔍</span>
          </div>
          <button className="collection-new-btn" onClick={openCreateModal}>
            + New Collection
          </button>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={() => setShowModal(false)}>&#10005;</button>
              <h2 className="modal-title">New Collection</h2>
              <form onSubmit={handleCreate}>
                <input
                  className="modal-input"
                  type="text"
                  value={newCollection.type}
                  onChange={e => setNewCollection({ ...newCollection, type: e.target.value })}
                  placeholder="Type (e.g. recycle)"
                  required
                />
                <input
                  className="modal-input"
                  type="number"
                  value={newCollection.amount}
                  onChange={e => setNewCollection({ ...newCollection, amount: e.target.value })}
                  placeholder="Amount in kg"
                  required
                />
                <input
                  className="modal-input"
                  type="text"
                  value={newCollection.notes}
                  onChange={e => setNewCollection({ ...newCollection, notes: e.target.value })}
                  placeholder="Notes"
                  required
                />
                <select
                  className="modal-input"
                  value={newCollection.route}
                  onChange={e => setNewCollection({ ...newCollection, route: e.target.value })}
                  required
                >
                  <option value="">Select a route</option>
                  {routes.map(route => (
                    <option key={route._id} value={route._id}>
                      {route.routeName} ({route.routeId}) - {route.status}
                    </option>
                  ))}
                </select>
                <select
                  className="modal-input"
                  value={newCollection.status}
                  onChange={e => setNewCollection({ ...newCollection, status: e.target.value })}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
                <button className="modal-create-btn" type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'CREATE'}
                </button>
              </form>
              {error && <div className="modal-error">{error}</div>}
            </div>
          </div>
        )}

        {error && <div className="collection-error">{error}</div>}

        <div className="collection-stats-grid">
          {loading ? (
            <div className="collection-loading">Loading collections...</div>
          ) : filteredCollections.length > 0 ? (
            filteredCollections.map((col) => (
              <div className="collection-stat-card" key={col._id}>
                <div className="collection-card-header">
                  <h3>{col.type}</h3>
                  <button onClick={() => openEditModal(col)} className="edit-btn">✏️ Edit</button>
                </div>
                <div className="collection-card-body">
                  <p className="collection-amount">{col.amount} kg</p>
                  <p className="collection-notes">{col.notes}</p>
                  <p className="collection-date">
                    {new Date(col.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="collection-empty">
              {searchTerm ? 'No collections match your search.' : 'No collections found.'}
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={() => setShowModal(false)}>&#10005;</button>
              <h2 className="modal-title">
                {editingCollection ? 'Edit Collection' : 'New Collection'}
              </h2>
              <form onSubmit={editingCollection ? handleUpdate : handleCreate}>
                <input
                  className="modal-input"
                  type="text"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Type"
                  required
                />
                <input
                  className="modal-input"
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Amount in kg"
                  required
                />
                <input
                  className="modal-input"
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes"
                  required
                />
                <input
                  className="modal-input"
                  type="date"
                  value={formData.collectionDate}
                  onChange={e => setFormData({ ...formData, collectionDate: e.target.value })}
                  required
                />
                <div className="modal-buttons">
                  <button className="modal-create-btn" type="submit" disabled={loading}>
                    {loading ? (editingCollection ? 'Updating...' : 'Creating...') : (editingCollection ? 'Update' : 'Create')}
                  </button>
                  {editingCollection && (
                    <button className="modal-delete-btn" type="button" onClick={handleDelete}>
                      Delete
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Collection;
