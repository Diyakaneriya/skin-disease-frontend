// src/pages/Admin.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // Import the Navbar component
import { authService } from "../services/api"; // Import the auth service

const Admin = () => {
  const navigate = useNavigate();
  
  // Function to handle doctor approval or rejection
  const handleDoctorStatus = async (doctorId, status) => {
    try {
      setLoading(true);
      await authService.updateDoctorStatus(doctorId, status);
      
      // Update the pending doctors list
      const updatedPendingDoctors = await authService.getPendingDoctors();
      setPendingDoctors(updatedPendingDoctors);
      
      // Refresh the users list to include the newly approved/rejected doctor
      const updatedUsers = await authService.getAllUsers();
      setUsers(updatedUsers);
      
      setSuccessMessage(`Doctor ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(`Error ${status} doctor:`, err);
      setError(`Failed to ${status} doctor. Please try again.`);
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // State for user data
  const [users, setUsers] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const adminStyles = {
    container: {
      paddingTop: "80px", // Account for fixed navbar
      minHeight: "100vh",
      backgroundColor: "#f8f9fa"
    },
    content: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "20px"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px"
    },
    card: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      padding: "20px",
      marginBottom: "20px"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse"
    },
    th: {
      padding: "12px",
      textAlign: "left",
      borderBottom: "1px solid #ddd",
      backgroundColor: "#f1f1f1"
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #eee"
    },
    homeButton: {
      padding: "8px 16px",
      backgroundColor: "#111827",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }
  };

  // Fetch users data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Check if user is admin before fetching
        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
          setError('Admin access required');
          // Redirect to home page after a delay
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Fetch both regular users and pending doctors
        const [userData, pendingDoctorsData] = await Promise.all([
          authService.getAllUsers(),
          authService.getPendingDoctors()
        ]);
        
        setUsers(userData);
        setPendingDoctors(pendingDoctorsData);
      } catch (err) {
        console.error('Error fetching data:', err);

        // More specific error handling
        if (err.message.includes('401')) {
          setError('Session expired. Please log in again.');
          setTimeout(() => navigate('/'), 3000);
        } else if (err.message.includes('403')) {
          setError('Admin privileges required to access this page.');
          setTimeout(() => navigate('/'), 3000);
        } else {
          setError('Failed to load data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <>
      <Navbar /> {/* Include the same Navbar */}

      <div style={adminStyles.container}>
        <div style={adminStyles.content}>
          <div style={adminStyles.header}>
            <h1>Admin Dashboard</h1>
            <button
              style={adminStyles.homeButton}
              onClick={() => navigate("/")}
            >
              <i className="fa-solid fa-house"></i>
              Return to Home
            </button>
          </div>

          {/* Admin Content Sections */}
          {error && <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}
          {successMessage && <div style={{ padding: '10px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', marginBottom: '20px' }}>{successMessage}</div>}
          
          {/* Pending Doctor Approvals Section */}
          <div style={{...adminStyles.card, borderLeft: '4px solid #f59e0b', marginBottom: '30px'}}>
            <h2 style={{color: '#d97706'}}>Pending Doctor Approvals</h2>
            {loading ? (
              <p>Loading pending approvals...</p>
            ) : pendingDoctors.length === 0 ? (
              <p>No pending doctor approvals at this time.</p>
            ) : (
              <table style={adminStyles.table}>
                <thead>
                  <tr>
                    <th style={adminStyles.th}>ID</th>
                    <th style={adminStyles.th}>Name</th>
                    <th style={adminStyles.th}>Email</th>
                    <th style={adminStyles.th}>Degree</th>
                    <th style={adminStyles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDoctors.map(doctor => (
                    <tr key={doctor.id}>
                      <td style={adminStyles.td}>{doctor.id}</td>
                      <td style={adminStyles.td}>{doctor.name}</td>
                      <td style={adminStyles.td}>{doctor.email}</td>
                      <td style={adminStyles.td}>
                        {doctor.degree_path ? (
                          <a 
                            href={`http://localhost:5001/${doctor.degree_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              color: '#2563eb',
                              textDecoration: 'underline'
                            }}
                          >
                            View Degree
                          </a>
                        ) : (
                          <span style={{color: '#dc2626'}}>No degree uploaded</span>
                        )}
                      </td>
                      <td style={adminStyles.td}>
                        <button 
                          onClick={() => handleDoctorStatus(doctor.id, 'approved')}
                          style={{
                            padding: "4px 8px",
                            marginRight: "8px",
                            backgroundColor: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                          disabled={loading}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleDoctorStatus(doctor.id, 'rejected')}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                          disabled={loading}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* User Management Section */}
          <div style={adminStyles.card}>
            <h2>User Management</h2>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <table style={adminStyles.table}>
                <thead>
                  <tr>
                    <th style={adminStyles.th}>ID</th>
                    <th style={adminStyles.th}>Name</th>
                    <th style={adminStyles.th}>Email</th>
                    <th style={adminStyles.th}>Role</th>
                    <th style={adminStyles.th}>Status</th>
                    <th style={adminStyles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td style={adminStyles.td}>{user.id}</td>
                      <td style={adminStyles.td}>{user.name}</td>
                      <td style={adminStyles.td}>{user.email}</td>
                      <td style={adminStyles.td}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor:
                            user.role === "admin" ? "#6366f1" :
                              user.role === "doctor" ? "#10b981" : "#f59e0b",
                          color: "white"
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={adminStyles.td}>
                        {user.role === 'doctor' && user.approval_status && (
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor:
                              user.approval_status === "approved" ? "#10b981" :
                                user.approval_status === "rejected" ? "#ef4444" : "#f59e0b",
                            color: "white"
                          }}>
                            {user.approval_status}
                          </span>
                        )}
                      </td>
                      <td style={adminStyles.td}>
                        <button style={{
                          padding: "4px 8px",
                          marginRight: "8px",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}>
                          Edit
                        </button>
                        <button style={{
                          padding: "4px 8px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Additional admin sections can be added here */}
          <div style={adminStyles.card}>
            <h2>System Analytics</h2>
            <p>Total Users: {users.length}</p>
            <p>Pending Doctor Approvals: {pendingDoctors.length}</p>
            {/* Add charts/analytics here */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;