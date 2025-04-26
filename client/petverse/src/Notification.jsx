import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./Notification.css";
import { getApiUrl } from "./apiConfig";

function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const loggedInUser = localStorage.getItem("loggedInUser");
                if (!loggedInUser) {
                    navigate("/login");
                    return;
                }
                const userObj = JSON.parse(loggedInUser);
                const response = await axios.get(
                    getApiUrl(`api/users/${userObj._id}/notifications`)
                );
                setNotifications(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
                setError("Failed to fetch notifications");
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [navigate]);

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(getApiUrl(`api/users/notifications/${notificationId}`));
            setNotifications(notifications.filter(n => n._id !== notificationId));
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="notification-page-wrapper">
            <div className="notification-nav">
                <div className="petverse-logo-container">
                    <h1 className="petverse-logo">PetVerse</h1>
                </div>
                <nav>
                    <ul>
                        <li>
                            <a href="/dashboard">
                                <i className="fas fa-home"></i>
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a href="/marketplace">
                                <i className="fas fa-shopping-cart"></i>
                                <span>Marketplace</span>
                            </a>
                        </li>
                        <li>
                            <a href="/pet-marketplace">
                                <i className="fas fa-paw"></i>
                                <span>Pet Marketplace</span>
                            </a>
                        </li>
                        <li>
                            <a href="/adoption">
                                <i className="fas fa-heart"></i>
                                <span>Adoption</span>
                            </a>
                        </li>
                        <li>
                            <a href="/adopt-message">
                                <i className="fas fa-envelope"></i>
                                <span>AdoptMessages</span>
                            </a>
                        </li>
                        <li>
                            <a href="/profile">
                                <i className="fas fa-user"></i>
                                <span>Profile</span>
                            </a>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    localStorage.removeItem("loggedInUser");
                                    navigate("/login");
                                }}
                                className="logout-button"
                            >
                                <i className="fas fa-sign-out-alt"></i>
                                <span>Logout</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
            <div className="notification-content">
                <div className="notification-hero">
                    <h1 className="notification-hero-title">Notifications</h1>
                </div>
                <div className="notification-content-wrapper">
                    <div className="notification-main">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                <i className="fas fa-bell-slash"></i>
                                <h3>No Notifications</h3>
                                <p>You don't have any notifications yet.</p>
                            </div>
                        ) : (
                            <div className="notification-list">
                                {notifications.map((notification) => (
                                    <div key={notification._id} className={`notification-item notification-${notification.status}`}>
                                        <div className="notification-content">
                                            <div className="notification-header">
                                                <h3>{notification.description}</h3>
                                                <span className="notification-timestamp">
                                                    {new Date(notification.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="notification-details">
                                                <p><strong>From:</strong> {notification.requesterName}</p>
                                                <p><strong>Pet Type:</strong> {notification.petType}</p>
                                            </div>
                                            {notification.imageUrl && (
                                                <div className="notification-image">
                                                    <img src={getApiUrl(notification.imageUrl)} alt="Pet" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="notification-actions">
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="delete-button"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Notification; 