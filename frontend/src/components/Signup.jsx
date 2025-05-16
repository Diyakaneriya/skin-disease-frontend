import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import "./Signup.css";

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
  const fileInputRef = useRef(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
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
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setDegree(e.target.files[0]);
    } else {
      setDegree(null);
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
          
          <div>
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name" 
              placeholder="Enter your name" 
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email">E-Mail</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
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
          <div style={{padding: '5px', margin: '5px 0', fontSize: '12px', color: '#666'}}>
            Current role: {role}
          </div>
          
          {role === "doctor" && (
            <div className="degree-upload" style={{display: 'block', marginTop: '15px', marginBottom: '15px', border: '1px solid #ddd', padding: '15px', borderRadius: '4px', backgroundColor: '#f9f9f9'}}>
              <label htmlFor="degree" style={{fontWeight: 'bold', color: '#333'}}>Upload Degree Certificate (Required for Doctors)</label>
              <input
                type="file"
                id="degree"
                ref={fileInputRef}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
                style={{display: 'block', width: '100%', marginTop: '10px', marginBottom: '10px'}}
              />
              <small style={{display: 'block', color: '#666'}}>Accepted formats: PDF, JPG, JPEG, PNG (Max: 5MB)</small>
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