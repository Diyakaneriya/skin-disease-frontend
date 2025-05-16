import { useState, useEffect } from "react";
import UserModal from "./UserModal";
import { authService } from "../services/api"; // Import the service
import { Link } from "react-router-dom"; // Import Link for navigation

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in on component mount
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);
  
  const handleUserClick = () => {
    if (user) {
      // If user is logged in, log them out
      if (confirm('Are you sure you want to log out?')) {
        authService.logout();
        setUser(null);
        window.location.reload();
      }
    } else {
      // If user is not logged in, open the modal
      setIsModalOpen(true);
    }
  };
  
  const navStyles = {
    nav: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid #f3f4f6"
    },
    container: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "0 16px"
    },
    flex: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "64px"
    },
    logo: {
      fontSize: "2.25rem",
      fontWeight: 600,
      background: "linear-gradient(to right, #374151, #111827)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    },
    navLinks: {
      display: "flex",
      gap: "32px"
    },
    button: {
      padding: "8px 16px",
      backgroundColor: "transparent",
      color: "#374151",
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease"
    }
  };
  
  return (
    <>
      <nav style={navStyles.nav}>
        <div style={navStyles.container}>
          <div style={navStyles.flex}>
            <div>
              <span style={navStyles.logo}>Skin-Disease-Portal</span>
            </div>
            <div style={navStyles.navLinks}>
              {/* Conditional rendering based on user role */}
              {user?.role === 'admin' ? (
                <Link to="/admin" style={navStyles.button}>
                  Admin Page
                </Link>
              ) : (
                <>
                  <button style={navStyles.button}>Home</button>
                  <button style={navStyles.button}>How to Use</button>
                  <button style={navStyles.button}>Types</button>
                </>
              )}
            </div>

            <div>
              <button style={navStyles.button} onClick={handleUserClick}>
                <i className="fa-solid fa-user"></i>
                {user && <span style={{marginLeft: '4px'}}>{user.name}</span>}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Navbar;