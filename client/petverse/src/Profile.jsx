import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

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
      const response = await axios.get(`http://localhost:3000/api/profile?email=${encodeURIComponent(email)}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile', error);
      setMessage('Failed to load profile');
    }
  };

  const fetchAdoptionRequests = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/users/${userId}/adoption-requests`);
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
      const response = await axios.put('http://localhost:3000/api/profile', {
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
      await axios.patch(`http://localhost:3000/api/users/${userObj._id}/adoption-requests/${requestId}`);
      setAdoptionRequests(adoptionRequests.map(req => req._id === requestId ? { ...req, status: 'approved' } : req));
    } catch (error) {
      console.error('Failed to approve adoption request', error);
    }
  };

  return (
    <div className="profile-container" style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Your Profile</h2>
      {message && <p style={{ textAlign: 'center', color: '#007bff', marginBottom: '20px' }}>{message}</p>}
      <form onSubmit={handleSubmit} className="profile-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
        <label style={{ fontWeight: 'bold', color: '#555' }}>
          Name:
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ fontWeight: 'bold', color: '#555' }}>
          Email:
          <input
            type="email"
            name="email"
            value={profile.email}
            disabled
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#e9ecef' }}
          />
        </label>
        <label style={{ fontWeight: 'bold', color: '#555' }}>
          Phone:
          <input
            type="text"
            name="phone"
            value={profile.phone}
            disabled
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#e9ecef' }}
          />
        </label>
        <label style={{ fontWeight: 'bold', color: '#555' }}>
          Favourite Pet:
          <input
            type="text"
            name="favouritePet"
            value={profile.favouritePet}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <button
          type="submit"
          style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Update Profile
        </button>
      </form>
      <h3 style={{ color: '#333', marginBottom: '15px' }}>Adoption Requests</h3>
      {adoptionRequests.length === 0 ? (
        <p>No adoption requests.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {adoptionRequests.map(request => (
            <div key={request._id} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: '#fff' }}>
              <div><strong>Requester:</strong> {request.requesterName}</div>
              <div><strong>Email:</strong> {request.requesterEmail || 'N/A'}</div>
              <div><strong>Pet Type:</strong> {request.petType}</div>
              <div><strong>Description:</strong> {request.description}</div>
              <div><strong>Location:</strong> {request.location}</div>
              {request.imageUrl && <img src={`http://localhost:3000${request.imageUrl}`} alt="Pet" style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }} />}
              <div><strong>Status:</strong> {request.status}</div>
              {request.status === 'pending' && (
                <button
                  onClick={() => approveRequest(request._id)}
                  style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Approve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;
