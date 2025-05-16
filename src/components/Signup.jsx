import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import "./Signup.css";
import "./form-validation.css";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [degree, setDegree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
    degree: ""
  });
  const fileInputRef = useRef(null);

  const validateName = (name) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const nameError = !formData.name ? 'Name is required' : !validateName(formData.name) ? 'Name must be at least 2 characters' : '';
    const emailError = !formData.email ? 'Email is required' : !validateEmail(formData.email) ? 'Please enter a valid email address' : '';
    const passwordError = !formData.password ? 'Password is required' : !validatePassword(formData.password) ? 'Password must be at least 6 characters' : '';
    let degreeError = '';

    if (role === 'doctor' && !degree) {
      degreeError = 'Please upload your degree certificate';
    }

    setValidationErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      degree: degreeError
    });

    // If there are validation errors, don't submit
    if (nameError || emailError || passwordError || degreeError) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // For patient registration
      if (role === "patient") {
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: role
        };

        const response = await authService.register(userData);
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/"), 2000);
      }
      // For doctor registration with degree upload
      else if (role === "doctor") {
        if (!degree) {
          setError("Please upload your degree certificate");
          setLoading(false);
          return;
        }

        // Create FormData for file upload
        const formDataObj = new FormData();
        formDataObj.append("name", formData.name);
        formDataObj.append("email", formData.email);
        formDataObj.append("password", formData.password);
        formDataObj.append("degree", degree);

        const response = await authService.registerDoctor(formDataObj);
        setSuccess("Doctor registration submitted successfully! Your account is pending approval by an administrator.");
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    console.log('Role changed to:', newRole); // Debug log
    setRole(newRole);
    // Reset degree file when switching roles
    if (newRole !== "doctor") {
      setDegree(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    // Validate field as user types
    switch (id) {
      case 'name':
        if (!value) {
          setValidationErrors(prev => ({ ...prev, name: 'Name is required' }));
        } else if (!validateName(value)) {
          setValidationErrors(prev => ({ ...prev, name: 'Name must be at least 2 characters' }));
        } else {
          setValidationErrors(prev => ({ ...prev, name: '' }));
        }
        break;
      case 'email':
        if (!value) {
          setValidationErrors(prev => ({ ...prev, email: 'Email is required' }));
        } else if (!validateEmail(value)) {
          setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
        } else {
          setValidationErrors(prev => ({ ...prev, email: '' }));
        }
        break;
      case 'password':
        if (!value) {
          setValidationErrors(prev => ({ ...prev, password: 'Password is required' }));
        } else if (!validatePassword(value)) {
          setValidationErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
        } else {
          setValidationErrors(prev => ({ ...prev, password: '' }));
        }
        break;
      default:
        break;
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

  return (
    <div className="wrapper signUp">
      <div className="illustration">
        <img src="/api/placeholder/800/600" alt="illustration" />
      </div>
      <div className="form">
        <div className="heading">CREATE AN ACCOUNT</div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleInputChange}
              className={validationErrors.name ? 'input-error' : ''}
              required
            />
            {validationErrors.name && <div className="error-text">{validationErrors.name}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="email">E-Mail</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className={validationErrors.email ? 'input-error' : ''}
              required
            />
            {validationErrors.email && <div className="error-text">{validationErrors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
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

          <div className="role-selection">
            <label className="role-label">Select your role:</label>
            <div className="role-options">
              <div className="role-option">
                <input
                  type="radio"
                  id="patient"
                  name="role"
                  value="patient"
                  checked={role === "patient"}
                  onChange={handleRoleChange}
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
                  onChange={handleRoleChange}
                />
                <label htmlFor="doctor">Doctor</label>
              </div>
            </div>
          </div>

          {/* Debug information */}
          <div style={{ padding: '5px', margin: '5px 0', fontSize: '12px', color: '#666' }}>
            Current role: {role}
          </div>

          {role === "doctor" && (
            <div className={`degree-upload form-group ${validationErrors.degree ? 'has-error' : ''}`} style={{ display: 'block', marginTop: '15px', marginBottom: '15px', border: '1px solid #ddd', padding: '15px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <label htmlFor="degree" style={{ fontWeight: 'bold', color: '#333' }}>Upload Degree Certificate (Required for Doctors)</label>
              <input
                type="file"
                id="degree"
                ref={fileInputRef}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
                style={{ display: 'block', width: '100%', marginTop: '10px', marginBottom: '10px' }}
                className={validationErrors.degree ? 'input-error' : ''}
              />
              {validationErrors.degree && <div className="error-text">{validationErrors.degree}</div>}
              <small style={{ display: 'block', color: '#666' }}>Accepted formats: PDF, JPG, JPEG, PNG (Max: 5MB)</small>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Submit"}
          </button>
          <h2 align="center" className="or">
            OR
          </h2>
        </form>
        <p>
          Have an account? <Link to="/"> Login </Link>
        </p>
      </div>
    </div>
  );
}