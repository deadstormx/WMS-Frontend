"use client"
import "./Sidebar.css"

function Sidebar({ activeNavItem, setActiveNavItem }) {
  const navItems = [
    { name: "Dashboard", icon: "dashboard" },
    { name: "Collections", icon: "collections" },
    { name: "Routes", icon: "routes" },
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <i className="icon-recycle"></i>
          </div>
          <span className="logo-text">GreenBin</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <a
                href="#"
                className={`nav-item ${activeNavItem === item.name ? "active" : ""}`}
                onClick={() => setActiveNavItem(item.name)}
              >
                <i className={`icon-${item.icon}`}></i>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar

