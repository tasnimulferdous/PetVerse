import { useState } from 'react';
import axios from 'axios';
import './App.css';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    favouritePet: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:3000/api/signup', formData);
      setMessage(response.data.message);
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        favouritePet: '',
      });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="form-container twitter-style">
      <a href="/login" className="top-right-link">Login</a>
      <h1 className="title twitter-title">PetVerse</h1>
      <button className="subtitle-button" type="button">Signup</button>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="form twitter-form">
        <label>Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>Phone:</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />

        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Password:</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <label>Favourite Pet:</label>
        <input type="text" name="favouritePet" value={formData.favouritePet} onChange={handleChange} required />

        <button type="submit" className="twitter-button">Signup</button>
      </form>
    </div>
  );
}

export default Signup;
