import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { apiRequest } from './apiConfig';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleLoginTypeChange = (e) => {
    setLoginType(e.target.value);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (loginType === 'admin') {
      // Hardcoded admin login
      if (formData.email === 'admin' && formData.password === 'admin123') {
        const adminUser = { _id: 'admin', name: 'Admin', email: 'admin', isAdmin: true };
        localStorage.setItem('loggedInUser', JSON.stringify(adminUser));
        navigate('/admin/dashboard');
      } else {
        setMessage('Invalid admin credentials');
      }
      return;
    }
    // User login
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include' // Important: this tells the browser to include cookies
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      setMessage(data.message);
      // Store user info in localStorage
      if (data.user) {
        localStorage.setItem('loggedInUser', JSON.stringify(data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      setMessage(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="form-container twitter-style">
      <h1 className="title twitter-title">PetVerse</h1>
      <button className="subtitle-button" type="button">Login</button>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="form twitter-form">
        <div>
          <label>
            <input
              type="radio"
              name="loginType"
              value="user"
              checked={loginType === 'user'}
              onChange={handleLoginTypeChange}
            />
            User Login
          </label>
          <label style={{ marginLeft: '20px' }}>
            <input
              type="radio"
              name="loginType"
              value="admin"
              checked={loginType === 'admin'}
              onChange={handleLoginTypeChange}
            />
            Admin Login
          </label>
        </div>

        <label>{loginType === 'admin' ? 'Username:' : 'Email:'}</label>
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="twitter-button">Login</button>
      </form>
      <p className="bottom-message">
        If you do not have an account, <a href="/signup" className="bottom-link">Sign Up</a>
      </p>
    </div>
  );
}

export default Login;
