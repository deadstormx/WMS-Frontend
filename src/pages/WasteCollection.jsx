import Collection from "./AdminDashboard"
import "./WasteCollection.css"

function WasteCollections() {
  const collectionData = [
    { title: "Total Collected", amount: "856 kg", icon: "refresh" },
    { title: "Organic Collected", amount: "856 kg", icon: "refresh" },
    { title: "Recyclable Collected", amount: "856 kg", icon: "refresh" },
  ]

  return (
    <div className="waste-collections">
      <h1 className="page-title">Waste Collections</h1>

      <div className="actions-bar">
        <div className="search-container">
          <i className="icon-search"></i>
          <input type="text" placeholder="Search collections..." className="search-input" />
        </div>

        <button className="new-collection-btn">
          <i className="icon-plus"></i>
          New Collection
        </button>
      </div>

      <div className="collection-cards">
        {collectionData.map((card) => (
          <CollectionCard key={card.title} title={card.title} amount={card.amount} icon={card.icon} />
        ))}
      </div>
    </div>
  )
}

export default WasteCollections

