import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import "./AdoptMessage.css";
import { getApiUrl, API_URL } from "./apiConfig";

ChartJS.register(ArcElement, Tooltip, Legend);

function AdoptMessage() {
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMessages, setFilteredMessages] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = localStorage.getItem("loggedInUser");
        if (!loggedInUser) {
            navigate("/login");
            return;
        }
        const userObj = JSON.parse(loggedInUser);
        fetchMessages(userObj._id);
    }, [navigate]);

    useEffect(() => {
        // Filter messages based on search query
        const filtered = messages.filter(message =>
            message.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredMessages(filtered);
    }, [searchQuery, messages]);

    const handleSearch = (e) => {
        e.preventDefault();
        // Search is already handled by the useEffect above
    };

    const fetchMessages = async (userId) => {
        try {
            const response = await axios.get(
                getApiUrl(`api/users/${userId}/notifications`)
            );
            setMessages(response.data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const updateRequestStatus = async (messageId, status) => {
        try {
            await axios.patch(
                getApiUrl(`api/users/notifications/${messageId}/status`),
                { status }
            );
            setMessages(
                messages.map((m) => (m._id === messageId ? { ...m, status } : m))
            );
        } catch (error) {
            console.error(`Failed to update message status to ${status}`, error);
        }
    };

    const approveRequest = async (messageId) => {
        try {
            const loggedInUser = localStorage.getItem("loggedInUser");
            if (!loggedInUser) {
                console.error("No logged in user found");
                return;
            }
            const userObj = JSON.parse(loggedInUser);

            // First update the message status
            await updateRequestStatus(messageId, "approved");

            // Then delete the adoption post
            const message = messages.find((m) => m._id === messageId);
            if (message && message.postId) {
                await axios.delete(getApiUrl(`api/adoption/${message.postId}`), {
                    data: { user: userObj.name },
                });
            }
        } catch (error) {
            console.error("Failed to approve request and delete post", error);
        }
    };

    const denyRequest = (messageId) => {
        updateRequestStatus(messageId, "denied");
    };

    const deleteMessage = async (messageId) => {
        try {
            await axios.delete(getApiUrl(`api/users/notifications/${messageId}`));
            setMessages(messages.filter((m) => m._id !== messageId));
        } catch (error) {
            console.error("Failed to delete message", error);
        }
    };

    // Calculate message statistics
    const getMessageStats = () => {
        const stats = {
            pending: 0,
            approved: 0,
            denied: 0
        };

        messages.forEach(message => {
            stats[message.status]++;
        });

        return stats;
    };

    // Prepare chart data
    const getChartData = () => {
        const stats = getMessageStats();
        return {
            labels: ['Pending', 'Approved', 'Rejected'],
            datasets: [
                {
                    data: [stats.pending, stats.approved, stats.denied],
                    backgroundColor: [
                        'rgb(193, 171, 30, 0.9)',
                        'rgb(36, 137, 90, 0.9)',
                        'rgb(215, 56, 45, 0.9)',
                    ],
                    borderColor: [
                        '#fff',
                        '#fff',
                        '#fff',
                    ],
                    borderWidth: 2,
                },
            ],
        };
    };

    const chartOptions = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    boxWidth: 10,
                    padding: 20
                }
            },
            title: {
                display: true,
                text: 'Adoption Requests Status',
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        maintainAspectRatio: false,
        layout: {
            padding: {
                right: 0
            }
        }
    };

    return (
        <div className="adoptmessage-page-wrapper">
            <div className="adoptmessage-nav">
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
                                <i className="fas fa-comments"></i>
                                <span>AdoptMessages</span>
                            </a>
                        </li>
                        <li>
                            <a href="/adopt-message">
                                <i className="fas fa-bell" style={{ marginRight: '8px' }}></i>
                                <span>Notifications</span>
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
            <div className="adoptmessage-content">
                <div className="adoptmessage-hero">
                    <h1 className="adoptmessage-hero-title">Adoption Messages</h1>
                </div>
                <div className="adoptmessage-content-wrapper">
                    <div className="adoptmessage-main">
                        <form className="adoptmessage-search" onSubmit={handleSearch}>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by adoption reason..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="search-button">
                                <i className="fas fa-search"></i>
                                <span>Search</span>
                            </button>
                        </form>
                        {filteredMessages.length === 0 ? (
                            <p className="no-messages">No messages found.</p>
                        ) : (
                            <ul className="message-list">
                                {filteredMessages.map((message) => (
                                    <li
                                        key={message._id}
                                        className={`message-item message-${message.status}`}
                                    >
                                        <p className="message-field">
                                            <strong>Pet Type:</strong> {message.petType}
                                        </p>
                                        <p className="message-field">
                                            <strong>Requester:</strong> {message.requesterName}
                                        </p>
                                        <p className="message-field">
                                            <strong>Adoption Reason:</strong> {message.description}
                                        </p>
                                        {message.imageUrl && (
                                            <img
                                                src={`${API_URL}${message.imageUrl}`}
                                                alt="Pet"
                                                className="message-image"
                                            />
                                        )}
                                        <p className="message-status">
                                            <strong>Status:</strong> {message.status}
                                        </p>
                                        <div className="message-actions">
                                            {message.status === "pending" && (
                                                <>
                                                    <button
                                                        onClick={() => approveRequest(message._id)}
                                                        className="approve-button"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => denyRequest(message._id)}
                                                        className="deny-button"
                                                    >
                                                        Deny
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => deleteMessage(message._id)}
                                                className="delete-button"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="adoptmessage-sidebar">
                        <div className="chart-container">
                            <Pie data={getChartData()} options={chartOptions} />
                        </div>
                        <div className="stats-summary">
                            <div className="stat-item stat-pending">
                                <span className="stat-label">Pending</span>
                                <span className="stat-value">{getMessageStats().pending}</span>
                            </div>
                            <div className="stat-item stat-approved">
                                <span className="stat-label">Approved</span>
                                <span className="stat-value">{getMessageStats().approved}</span>
                            </div>
                            <div className="stat-item stat-denied">
                                <span className="stat-label">Rejected</span>
                                <span className="stat-value">{getMessageStats().denied}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdoptMessage;
