import { useState } from "react"
import Header from "./Header"
import "./Collection1.css"

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setNewCollectionName("")
  }

  const handleCreateCollection = () => {
    console.log("Creating new collection:", newCollectionName)
    closeModal()
  }

  return (
    <div className="dashboard-container">
      <Header title="GreenBin" />

      <div className="dashboard-nav">
        <button className="nav-button active">Dashboard</button>
        <button className="nav-button">Collections</button>
        <button className="nav-button">Routes</button>
      </div>

      <div className="dashboard-content">
        <div className="search-bar">
          <input type="text" placeholder="Search collections..." className="search-input" />
          <span className="search-icon">Q.</span>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Collected</h3>
            <p className="stat-value">856 kg</p>
          </div>

          <div className="stat-card organic">
            <h3>Organic Collected</h3>
            <p className="stat-value">856 kg</p>
          </div>

          <div className="stat-card recyclable">
            <h3>Recyclable Collected</h3>
            <p className="stat-value">856 kg</p>
          </div>
        </div>

        <button className="new-collection-btn" onClick={openModal}>
          New Collection
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close-btn" onClick={closeModal}>
              ✕
            </button>
            <h2 className="modal-title">New Collection Name</h2>
            <input
              type="text"
              className="modal-input"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Enter collection name"
            />
            <button className="modal-create-btn" onClick={handleCreateCollection}>
              CREATE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard