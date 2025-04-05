import React, { useState } from "react";
import { Menu } from "lucide-react"; // Only keep the Menu icon
import { Link, useLocation } from "react-router-dom"; // Import Link and useLocation for routing

import "./DrawerMenu.css"; // Import the CSS file

const DrawerMenu = ({ links = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // Get current route location

  return (
    <>
      {/* Overlay to close the drawer when clicking outside */}
      {isOpen && <div className="drawer-overlay" onClick={() => setIsOpen(false)}></div>}

      {/* Drawer Sidebar */}
      <div className={`drawer ${isOpen ? "open" : ""}`}>
        <nav className="drawer-nav">
          {/* Render the links passed as a prop */}
          {links.map((link, index) => (
            <Link
              to={link.path}
              className={`drawer-link ${location.pathname === link.path ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
              key={index}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Menu Button to Open Drawer */}
      <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
        <Menu size={24} />
      </button>
    </>
  );
};

export default DrawerMenu;
