import React, { useState, useRef } from 'react';
import './UserModal.css';
import './form-validation.css';
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
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: '',
    degree: ''
  });
  const fileInputRef = useRef(null);

  // Validation functions
  const validateUsername = (name) => {
    return name.trim().length >= 2;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    
    if (!value) {
      setValidationErrors(prev => ({ ...prev, username: 'Username is required' }));
    } else if (!validateUsername(value)) {
      setValidationErrors(prev => ({ ...prev, username: 'Username must be at least 2 characters' }));
    } else {
      setValidationErrors(prev => ({ ...prev, username: '' }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (!value) {
      setValidationErrors(prev => ({ ...prev, email: 'Email is required' }));
    } else if (!validateEmail(value)) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (!value) {
      setValidationErrors(prev => ({ ...prev, password: 'Password is required' }));
    } else if (!validatePassword(value)) {
      setValidationErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
    } else {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setDegree(e.target.files[0]);
      setValidationErrors(prev => ({ ...prev, degree: '' }));
    } else {
      setDegree(null);
      if (role === 'doctor') {
        setValidationErrors(prev => ({ ...prev, degree: 'Please upload your degree certificate' }));
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate fields before submission
    let hasErrors = false;
    const newValidationErrors = { ...validationErrors };
    
    if (!isLogin) {
      // Validate username for signup
      if (!username) {
        newValidationErrors.username = 'Username is required';
        hasErrors = true;
      } else if (!validateUsername(username)) {
        newValidationErrors.username = 'Username must be at least 2 characters';
        hasErrors = true;
      } else {
        newValidationErrors.username = '';
      }
      
      // Validate degree for doctor role
      if (role === 'doctor' && !degree) {
        newValidationErrors.degree = 'Please upload your degree certificate';
        hasErrors = true;
      } else {
        newValidationErrors.degree = '';
      }
    }
    
    // Always validate email and password
    if (!email) {
      newValidationErrors.email = 'Email is required';
      hasErrors = true;
    } else if (!validateEmail(email)) {
      newValidationErrors.email = 'Please enter a valid email address';
      hasErrors = true;
    } else {
      newValidationErrors.email = '';
    }
    
    if (!password) {
      newValidationErrors.password = 'Password is required';
      hasErrors = true;
    } else if (!validatePassword(password)) {
      newValidationErrors.password = 'Password must be at least 6 characters';
      hasErrors = true;
    } else {
      newValidationErrors.password = '';
    }
    
    setValidationErrors(newValidationErrors);
    
    if (hasErrors) {
      return;
    }
    
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
                onChange={handleEmailChange}
                className={validationErrors.email ? 'input-error' : ''}
                required 
              />
              {validationErrors.email && <div className="error-text">{validationErrors.email}</div>}
            </>
          ) : (
            <>
              <label htmlFor="username">Username:</label>
              <div className="form-group">
                <input 
                  type="text" 
                  id="username" 
                  value={username}
                  onChange={handleUsernameChange}
                  className={validationErrors.username ? 'input-error' : ''}
                  required 
                />
                {validationErrors.username && <div className="error-text">{validationErrors.username}</div>}
              </div>
            </>
          )}
          
          {!isLogin && (
            <>
              <label htmlFor="email">Email:</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={handleEmailChange}
                className={validationErrors.email ? 'input-error' : ''}
                required 
              />
              {validationErrors.email && <div className="error-text">{validationErrors.email}</div>}
              
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
                    onChange={handleFileChange}
                    className={validationErrors.degree ? 'input-error' : ''}
                    required
                    style={{display: 'block', width: '100%', marginTop: '10px', marginBottom: '10px'}}
                  />
                  {validationErrors.degree && <div className="error-text">{validationErrors.degree}</div>}
                  <small style={{display: 'block', color: '#666'}}>Accepted formats: PDF, JPG, JPEG, PNG (Max: 5MB)</small>
                </div>
              )}
            </>
          )}
          
          <label htmlFor="password">Password:</label>
          <div className="form-group">
            <div className="password-input-container">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                value={password}
                onChange={handlePasswordChange}
                className={validationErrors.password ? 'input-error' : ''}
                required 
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={togglePasswordVisibility}
              >
                <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {validationErrors.password && <div className="error-text">{validationErrors.password}</div>}
          </div>
          
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