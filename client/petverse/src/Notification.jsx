import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { getApiUrl, API_URL } from './apiConfig';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(loggedInUser);
    fetchNotifications(userObj._id);
  }, [navigate]);

  const fetchNotifications = async (userId) => {
    try {
      const response = await axios.get(getApiUrl(`api/users/${userId}/notifications`));
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const updateRequestStatus = async (notificationId, status) => {
    try {
      await axios.patch(getApiUrl(`api/users/notifications/${notificationId}/status`), { status });
      setNotifications(notifications.map(n => n._id === notificationId ? { ...n, status } : n));
    } catch (error) {
      console.error(`Failed to update notification status to ${status}`, error);
    }
  };

  const approveRequest = (notificationId) => {
    updateRequestStatus(notificationId, 'approved');
  };

  const denyRequest = (notificationId) => {
    updateRequestStatus(notificationId, 'denied');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Notifications</h1>
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
              <a href="/profile">
                <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
                <span>Profile</span>
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
          <div className="notification-container">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications.</p>
            ) : (
              <ul className="notification-list">
                {notifications.map(notification => (
                  <li key={notification._id} className={`notification-item notification-${notification.status}`}>
                    <p className="notification-field"><strong>Requester:</strong> {notification.requesterName}</p>
                    <p className="notification-field"><strong>Pet Type:</strong> {notification.petType}</p>
                    <p className="notification-field"><strong>Description:</strong> {notification.description}</p>
                    <p className="notification-field"><strong>Location:</strong> {notification.location}</p>
                    {notification.imageUrl && <img src={`${API_URL}${notification.imageUrl}`} alt="Pet" className="notification-image" />}
                    <p className="notification-status"><strong>Status:</strong> {notification.status}</p>
                    {notification.status === 'pending' && (
                      <div className="notification-actions">
                        <button
                          onClick={() => approveRequest(notification._id)}
                          className="approve-button"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => denyRequest(notification._id)}
                          className="deny-button"
                        >
                          Deny
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Notification;
