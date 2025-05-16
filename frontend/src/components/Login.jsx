import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
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
					<div>
						<label htmlFor="email">E-Mail</label>
						<input 
							type="email" 
							id="email" 
							placeholder="Enter your email" 
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div>
						<label htmlFor="password">Password</label>
						<input 
							type="password" 
							id="password" 
							placeholder="Enter your password" 
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
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
