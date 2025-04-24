import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
      const response = await axios.get(`http://localhost:3000/api/users/${userId}/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const updateRequestStatus = async (notificationId, status) => {
    try {
      await axios.patch(`http://localhost:3000/api/users/notifications/${notificationId}/status`, { status });
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
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifications.map(notification => (
            <li key={notification._id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: notification.status === 'pending' ? '#d1e7dd' : notification.status === 'approved' ? '#cfe2ff' : '#f8d7da', borderRadius: '5px' }}>
              <p><strong>Requester:</strong> {notification.requesterName}</p>
              <p><strong>Pet Type:</strong> {notification.petType}</p>
              <p><strong>Description:</strong> {notification.description}</p>
              <p><strong>Location:</strong> {notification.location}</p>
              {notification.imageUrl && <img src={`http://localhost:3000${notification.imageUrl}`} alt="Pet" style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }} />}
              <p><strong>Status:</strong> {notification.status}</p>
              {notification.status === 'pending' && (
                <>
                  <button
                    onClick={() => approveRequest(notification._id)}
                    style={{ marginRight: '10px', padding: '8px 12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => denyRequest(notification._id)}
                    style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Deny
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notification;
