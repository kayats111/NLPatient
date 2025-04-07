import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import { useUser } from './context/UserContext';

import "./DrawerMenu.css";

const DrawerMenu = ({ links = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const location = useLocation();
  const navigate = useNavigate(); // Hook for redirecting
  const { user, login, logout } = useUser();  // Access context values


  // Check if user is logged in when the component mounts
  useEffect(() => {
    if(!user){
      setIsLoggedIn(false);
    }
    else{
      setIsLoggedIn(true)
    }
    // axios
    //   .get("http://localhost:3004/api/user/is_logged_in")
    //   .then((response) => {
    //     // console.log(response.data.value.logged_in)
    //     if (response.data.value.logged_in) {
    //       setIsLoggedIn(true);
    //     } else {
    //       setIsLoggedIn(false);
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error checking login status:", error);
    //     setIsLoggedIn(false);
    //   });

  }, []);

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    logout()
    navigate("/");
  };

  const handleBack2Main = () =>{
    navigate("/");
  };
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

      {/* Top bar with Menu button and Logout button */}
      <div className="top-bar">
        {location.pathname!=="/" && location.pathname!=="/signup" && location.pathname!=="/pending_approval" &&(
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
        {(location.pathname==="/signup" || location.pathname==="/pending_approval") && (
          <button className="logout-btn" onClick={handleBack2Main}>
            Go Back
          </button>
        )}
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          <Menu size={24} />
        </button>
      </div>
    </>
  );
};

export default DrawerMenu;
