import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';
import { apiRequest } from './apiConfig';

function Login() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const data = await apiRequest('api/login', {
        method: 'POST',
        body: JSON.stringify({ userName, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      localStorage.setItem('loggedInUser', JSON.stringify(data));
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to login. Please check your credentials.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="auth-container form-container twitter-style">
      <div className="auth-form-container">
        <h1 className="auth-title title twitter-title">PetVerse</h1>
        <h2 className="auth-subtitle">Sign In</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userName">Username</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="auth-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>
          <button type="submit" className="auth-button">Sign In</button>
        </form>
        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
