import React, { useState, useRef } from 'react';
import './UserModal.css';
import { authService } from '../services/api'; // Import the service

const UserModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [degree, setDegree] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        // Login
        await authService.login({
          email,
          password
        });
        onClose();
        window.location.reload(); // Refresh to update UI
      } else {
        // Register
        if (role === 'doctor') {
          // Doctor registration with degree upload
          if (!degree) {
            setError('Please upload your degree certificate');
            setLoading(false);
            return;
          }
          
          // Create FormData for file upload
          const formData = new FormData();
          formData.append('name', username);
          formData.append('email', email);
          formData.append('password', password);
          formData.append('degree', degree);
          
          await authService.registerDoctor(formData);
          setIsLogin(true);
          setError('Doctor registration submitted successfully. Your account is pending approval by an administrator.');
        } else {
          // Regular registration for patient and admin
          await authService.register({
            name: username,
            email,
            password,
            role: role
          });
          // Switch to login after successful registration
          setIsLogin(true);
          setError('Registration successful. Please login.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modalContent">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        
        {error && <p style={{color: 'red'}}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          {isLogin ? (
            <>
              <label htmlFor="email">Email:</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </>
          ) : (
            <>
              <label htmlFor="username">Username:</label>
              <input 
                type="text" 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </>
          )}
          
          {!isLogin && (
            <>
              <label htmlFor="email">Email:</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              
              {/* Role Selection */}
              <div className="role-selection">
                <label>Select your role:</label>
                <div className="role-options">
                  <div className="role-option">
                    <input
                      type="radio"
                      id="patient"
                      name="role"
                      value="patient"
                      checked={role === "patient"}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <label htmlFor="patient">Patient</label>
                  </div>
                  <div className="role-option">
                    <input
                      type="radio"
                      id="doctor"
                      name="role"
                      value="doctor"
                      checked={role === "doctor"}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <label htmlFor="doctor">Doctor</label>
                  </div>
                  <div className="role-option">
                    <input
                      type="radio"
                      id="admin"
                      name="role"
                      value="admin"
                      checked={role === "admin"}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <label htmlFor="admin">Admin</label>
                  </div>
                </div>
              </div>
              
              {/* File upload for doctor role */}
              {role === "doctor" && (
                <div className="degree-upload" style={{marginTop: '15px', marginBottom: '15px', border: '1px solid #ddd', padding: '15px', borderRadius: '4px', backgroundColor: '#f9f9f9'}}>
                  <label htmlFor="degree" style={{fontWeight: 'bold', color: '#333'}}>Upload Degree Certificate (Required for Doctors)</label>
                  <input
                    type="file"
                    id="degree"
                    ref={fileInputRef}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files.length > 0 ? setDegree(e.target.files[0]) : setDegree(null)}
                    required
                    style={{display: 'block', width: '100%', marginTop: '10px', marginBottom: '10px'}}
                  />
                  <small style={{display: 'block', color: '#666'}}>Accepted formats: PDF, JPG, JPEG, PNG (Max: 5MB)</small>
                </div>
              )}
            </>
          )}
          
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        
        <button 
          type="button" 
          onClick={() => setIsLogin(!isLogin)}
          className="switch-button"
        >
          {isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
        </button>
      </div>
    </div>
  );
};

export default UserModal;