import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:3000/api/login', formData);
      setMessage(response.data.message);
      // Store user info in localStorage
      if (response.status === 200 && response.data.user) {
        localStorage.setItem('loggedInUser', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="form-container twitter-style">
      <h1 className="title twitter-title">PetVerse</h1>
      <button className="subtitle-button" type="button">Login</button>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="form twitter-form">
        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Password:</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <button type="submit" className="twitter-button">Login</button>
      </form>
      <p className="bottom-message">
        If you do not have an account, <a href="/signup" className="bottom-link">Sign Up</a>
      </p>
    </div>
  );
}

export default Login;
