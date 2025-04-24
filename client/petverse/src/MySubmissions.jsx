import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { getApiUrl } from './apiConfig';

function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!user) {
          navigate('/login');
          return;
        }

        const response = await fetch(getApiUrl('api/marketplace/my-product-submissions'), {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }

        const data = await response.json();
        setSubmissions(data);
      } catch (error) {
        setError(error.message || 'Failed to fetch submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [navigate]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <i className="fas fa-check-circle"></i>;
      case 'rejected': return <i className="fas fa-times-circle"></i>;
      default: return <i className="fas fa-clock"></i>;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>My Product Submissions</h1>
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
              <a href="/marketplace">
                <i className="fas fa-shopping-cart" style={{ marginRight: '8px' }}></i>
                <span>Marketplace</span>
              </a>
            </li>
            <li>
              <a href="/submit-product">
                <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                <span>Submit Product</span>
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
          <div className="my-submissions-container">
            <div className="submissions-header">
              <h2>My Submissions</h2>
              <button 
                onClick={() => navigate('/submit-product')} 
                className="new-submission-button"
              >
                <i className="fas fa-plus"></i> New Submission
              </button>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : submissions.length === 0 ? (
              <div className="no-submissions">
                <i className="fas fa-inbox"></i>
                <h3>No Submissions Yet</h3>
                <p>You haven't submitted any products for approval yet.</p>
                <button 
                  onClick={() => navigate('/submit-product')} 
                  className="submit-now-button"
                >
                  Submit a Product Now
                </button>
              </div>
            ) : (
              <div className="submissions-list">
                {submissions.map(submission => (
                  <div key={submission._id} className="submission-card">
                    <div className="submission-image">
                      <img src={submission.image} alt={submission.name} />
                    </div>
                    <div className="submission-details">
                      <h3>{submission.name}</h3>
                      <p className="submission-brand">{submission.brand}</p>
                      <p className="submission-category">{submission.category}</p>
                      <p className="submission-price">${submission.price.toFixed(2)}</p>
                      <p className="submission-date">
                        Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`submission-status ${getStatusClass(submission.status)}`}>
                      <div className="status-indicator">
                        {getStatusIcon(submission.status)}
                        <span>{submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span>
                      </div>
                      {submission.status === 'rejected' && submission.rejectionReason && (
                        <div className="rejection-reason">
                          <p><strong>Reason:</strong> {submission.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MySubmissions; 