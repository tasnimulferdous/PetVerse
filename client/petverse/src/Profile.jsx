import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { getApiUrl } from './apiConfig';

function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    favouritePet: '',
  });
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(loggedInUser);
    fetchProfile(userObj.email);
    fetchAdoptionRequests(userObj._id);
  }, [navigate]);

  const fetchProfile = async (email) => {
    try {
      const response = await axios.get(getApiUrl(`api/profile?email=${encodeURIComponent(email)}`));
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile', error);
      setMessage('Failed to load profile');
    }
  };

  const fetchAdoptionRequests = async (userId) => {
    try {
      const response = await axios.get(getApiUrl(`api/users/${userId}/adoption-requests`));
      setAdoptionRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch adoption requests', error);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.put(getApiUrl('api/profile'), {
        email: profile.email,
        name: profile.name,
        favouritePet: profile.favouritePet,
      });
      setMessage(response.data.message || 'Profile updated successfully');
      // Update localStorage user info
      const updatedUser = { ...JSON.parse(localStorage.getItem('loggedInUser')), name: profile.name, favouritePet: profile.favouritePet };
      localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to update profile', error);
      setMessage('Failed to update profile');
    }
  };

  const approveRequest = async (requestId) => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(loggedInUser);
    try {
      await axios.patch(getApiUrl(`api/users/${userObj._id}/adoption-requests/${requestId}`));
      setAdoptionRequests(adoptionRequests.map(req => req._id === requestId ? { ...req, status: 'approved' } : req));
    } catch (error) {
      console.error('Failed to approve adoption request', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Your Profile</h1>
      </header>
      <div className="dashboard-body">
        <nav className="dashboard-sidebar">
          <ul>
            <li>
              <a href="/dashboard">
                <i className="fas fa-home" style={{ marginRight: '8px' }}></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/adoption">
                <i className="fas fa-paw" style={{ marginRight: '8px' }}></i>
                <span>Adoption</span>
              </a>
            </li>
            <li>
              <a href="/marketplace">
                <i className="fas fa-shopping-cart" style={{ marginRight: '8px' }}></i>
                <span>Marketplace</span>
              </a>
            </li>
            <li>
              <a href="/notifications">
                <i className="fas fa-bell" style={{ marginRight: '8px' }}></i>
                <span>Notification</span>
              </a>
            </li>
            <li>
              <button onClick={() => { localStorage.removeItem('loggedInUser'); navigate('/login'); }} className="logout-button">
                <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
        <main className="dashboard-main">
          <div className="profile-container">
            <h2 className="profile-title">Your Profile</h2>
            {message && <p className="profile-message">{message}</p>}
            <form onSubmit={handleSubmit} className="profile-form">
              <label className="profile-label">
                Name:
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  required
                  className="profile-input"
                />
              </label>
              <label className="profile-label">
                Email:
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="profile-input profile-input-disabled"
                />
              </label>
              <label className="profile-label">
                Phone:
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  disabled
                  className="profile-input profile-input-disabled"
                />
              </label>
              <label className="profile-label">
                Favourite Pet:
                <input
                  type="text"
                  name="favouritePet"
                  value={profile.favouritePet}
                  onChange={handleChange}
                  required
                  className="profile-input"
                />
              </label>
              <button type="submit" className="profile-submit-button">
                Update Profile
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;
