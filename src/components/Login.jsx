import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './form-validation.css';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [validationErrors, setValidationErrors] = useState({
		email: '',
		password: ''
	});
	const navigate = useNavigate();

	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validatePassword = (password) => {
		return password.length >= 6;
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

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		// Validate all fields before submission
		const emailError = !email ? 'Email is required' : !validateEmail(email) ? 'Please enter a valid email address' : '';
		const passwordError = !password ? 'Password is required' : !validatePassword(password) ? 'Password must be at least 6 characters' : '';
		
		setValidationErrors({
			email: emailError,
			password: passwordError
		});
		
		// If there are validation errors, don't submit
		if (emailError || passwordError) {
			return;
		}
		
		setLoading(true);
		setError('');

		try {
			// Call the login service
			await authService.login({
				email,
				password
			});
			// Redirect or refresh page after successful login
			window.location.reload();
		} catch (err) {
			console.error('Login error:', err);
			setError(err.response?.data?.message || 'Invalid email or password');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="wrapper signIn">
			<div className="illustration">
				<img src="https://source.unsplash.com/random" alt="illustration" />
			</div>
			<div className="form">
				<div className="heading">LOGIN</div>
				{error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="email">E-Mail</label>
						<input 
							type="email" 
							id="email" 
							placeholder="Enter your email" 
							value={email}
							onChange={handleEmailChange}
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
						{loading ? 'Processing...' : 'Login'}
					</button>
				</form>
				<p>
					Don't have an account ? <Link to="/signup"> Sign Up </Link>
				</p>
			</div>
		</div>
	);
}
