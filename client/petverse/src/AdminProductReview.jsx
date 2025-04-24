import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { apiRequest } from './apiConfig';

function AdminProductReview() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewStatus, setReviewStatus] = useState({ loading: false, success: false, error: '' });
  const navigate = useNavigate();

  // Fetch submissions on component mount
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser) {
          navigate('/login');
          return;
        }
        setUser(loggedInUser);

        // Check if user is admin
        if (!loggedInUser.isAdmin) {
          navigate('/dashboard');
          return;
        }

        const data = await fetch('http://localhost:3000/api/marketplace/product-submissions', {
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch submissions');
          }
          return response.json();
        });
        
        setSubmissions(data);
      } catch (error) {
        setError(error.message || 'Failed to fetch submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [navigate]);

  const handleApprove = async (submission) => {
    await reviewSubmission(submission._id, 'approved');
  };

  const handleReject = async () => {
    if (!activeSubmission) return;
    
    if (!rejectionReason.trim()) {
      setReviewStatus({ 
        loading: false, 
        success: false, 
        error: 'Please provide a reason for rejection' 
      });
      return;
    }
    
    await reviewSubmission(activeSubmission._id, 'rejected', rejectionReason);
  };

  const reviewSubmission = async (submissionId, status, reason = '') => {
    setReviewStatus({ loading: true, success: false, error: '' });
    
    try {
      const response = await fetch(`http://localhost:3000/api/marketplace/product-submissions/${submissionId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          rejectionReason: reason
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${status} submission`);
      }

      // Update the submissions list
      setSubmissions(submissions.filter(sub => sub._id !== submissionId));
      setReviewStatus({ loading: false, success: true, error: '' });
      
      // Reset active submission and rejection reason if this was a rejection
      if (status === 'rejected') {
        setActiveSubmission(null);
        setRejectionReason('');
      }
    } catch (error) {
      setReviewStatus({ 
        loading: false, 
        success: false, 
        error: error.message || `Failed to ${status} submission` 
      });
    }
  };

  // Filter submissions to pending ones
  const pendingSubmissions = submissions.filter(sub => sub.status === 'pending');

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Product Review</h1>
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
              <a href="/admin-dashboard">
                <i className="fas fa-tachometer-alt" style={{ marginRight: '8px' }}></i>
                <span>Admin Dashboard</span>
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
          <div className="admin-review-container">
            <h2>Product Submissions</h2>
            
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : pendingSubmissions.length === 0 ? (
              <div className="no-submissions">
                <i className="fas fa-check-circle"></i>
                <h3>No Pending Submissions</h3>
                <p>There are no product submissions waiting for review.</p>
              </div>
            ) : (
              <div className="admin-review-content">
                <div className="submissions-list">
                  <h3>Pending Submissions ({pendingSubmissions.length})</h3>
                  {pendingSubmissions.map(submission => (
                    <div 
                      key={submission._id} 
                      className={`submission-card ${activeSubmission && activeSubmission._id === submission._id ? 'active' : ''}`}
                      onClick={() => setActiveSubmission(submission)}
                    >
                      <div className="submission-image">
                        <img src={submission.image} alt={submission.name} />
                      </div>
                      <div className="submission-details">
                        <h4>{submission.name}</h4>
                        <p className="submission-brand">{submission.brand}</p>
                        <p className="submission-category">{submission.category}</p>
                        <p className="submission-price">${submission.price.toFixed(2)}</p>
                        <p className="submission-date">
                          Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                        <p className="submission-user">
                          By: {submission.user.name || 'Unknown User'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="submission-detail">
                  {activeSubmission ? (
                    <>
                      <div className="submission-detail-header">
                        <h3>Review Submission</h3>
                        {reviewStatus.success && (
                          <div className="success-message">Submission processed successfully!</div>
                        )}
                        {reviewStatus.error && (
                          <div className="error-message">{reviewStatus.error}</div>
                        )}
                      </div>
                      
                      <div className="submission-detail-content">
                        <div className="detail-image">
                          <img src={activeSubmission.image} alt={activeSubmission.name} />
                        </div>
                        
                        <div className="detail-info">
                          <h2>{activeSubmission.name}</h2>
                          <p className="detail-brand"><strong>Brand:</strong> {activeSubmission.brand}</p>
                          <p className="detail-category"><strong>Category:</strong> {activeSubmission.category}</p>
                          <p className="detail-price"><strong>Price:</strong> ${activeSubmission.price.toFixed(2)}</p>
                          <p className="detail-desc"><strong>Description:</strong> {activeSubmission.description}</p>
                          <p className="detail-user">
                            <strong>Submitted by:</strong> {activeSubmission.user.name || 'Unknown User'} 
                            ({activeSubmission.user.email})
                          </p>
                          <p className="detail-date">
                            <strong>Submitted on:</strong> {new Date(activeSubmission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="detail-actions">
                          <button 
                            onClick={() => handleApprove(activeSubmission)}
                            className="approve-button"
                            disabled={reviewStatus.loading}
                          >
                            {reviewStatus.loading ? 'Processing...' : 'Approve'}
                          </button>
                          
                          <div className="reject-section">
                            <textarea
                              placeholder="Reason for rejection (required)"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="rejection-reason-input"
                            ></textarea>
                            
                            <button 
                              onClick={handleReject}
                              className="reject-button"
                              disabled={reviewStatus.loading || !rejectionReason.trim()}
                            >
                              {reviewStatus.loading ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-selection">
                      <i className="fas fa-arrow-left"></i>
                      <h3>Select a submission to review</h3>
                      <p>Click on a submission from the list to review it.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminProductReview; 