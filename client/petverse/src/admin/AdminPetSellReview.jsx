import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_PET_SELL_POSTS_URL, REVIEW_PET_SELL_POST_URL, getImageUrl } from '../apiConfig';
import { toast } from 'react-toastify';
import '../App.css';

function AdminPetSellReview() {
  const navigate = useNavigate();
  const [petPosts, setPetPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activePost, setActivePost] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState('pending');
  const [reviewStatus, setReviewStatus] = useState({ loading: false, success: false, error: '' });

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!userData || !userData.isAdmin) {
          navigate('/login');
          return;
        }
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  // Fetch pet sell posts
  useEffect(() => {
    const fetchPetPosts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await axios.get(ADMIN_PET_SELL_POSTS_URL, { withCredentials: true });
        setPetPosts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching pet sell posts:', err);
        setError('Failed to fetch pet sell posts. Please try again later.');
        toast.error('Failed to fetch pet sell posts');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPetPosts();
    }
  }, [user]);

  const handleApprove = async () => {
    if (!activePost) return;
    setReviewStatus({ loading: true, success: false, error: '' });
    
    try {
      await axios.patch(
        REVIEW_PET_SELL_POST_URL(activePost._id), 
        { status: 'approved' },
        { withCredentials: true }
      );
      
      // Update the local state
      setPetPosts(petPosts.map(post => 
        post._id === activePost._id 
          ? { ...post, status: 'approved', reviewedAt: new Date() } 
          : post
      ));
      
      setReviewStatus({ loading: false, success: true, error: '' });
      toast.success(`Pet sell post "${activePost.name}" has been approved`);
      
      // Reset active post
      setActivePost(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error approving pet sell post:', error);
      setReviewStatus({ loading: false, success: false, error: 'Failed to approve pet sell post' });
      toast.error('Failed to approve pet sell post');
    }
  };

  const handleReject = async () => {
    if (!activePost) return;
    
    if (!rejectionReason.trim()) {
      setReviewStatus({ loading: false, success: false, error: 'Please provide a reason for rejection' });
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setReviewStatus({ loading: true, success: false, error: '' });
    
    try {
      await axios.patch(
        REVIEW_PET_SELL_POST_URL(activePost._id), 
        { 
          status: 'rejected',
          rejectionReason
        },
        { withCredentials: true }
      );
      
      // Update the local state
      setPetPosts(petPosts.map(post => 
        post._id === activePost._id 
          ? { 
              ...post, 
              status: 'rejected', 
              rejectionReason,
              reviewedAt: new Date() 
            } 
          : post
      ));
      
      setReviewStatus({ loading: false, success: true, error: '' });
      toast.success(`Pet sell post "${activePost.name}" has been rejected`);
      
      // Reset active post
      setActivePost(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting pet sell post:', error);
      setReviewStatus({ loading: false, success: false, error: 'Failed to reject pet sell post' });
      toast.error('Failed to reject pet sell post');
    }
  };

  // Filter pet posts based on selected filter
  const filteredPosts = petPosts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  // Filter for pending posts to display in the left panel
  const pendingPosts = petPosts.filter(post => post.status === 'pending');

  const getStatusBadge = (status) => {
    let badgeClass = '';
    
    switch (status) {
      case 'pending':
        badgeClass = 'status-pending';
        break;
      case 'approved':
        badgeClass = 'status-approved';
        break;
      case 'rejected':
        badgeClass = 'status-rejected';
        break;
      default:
        badgeClass = '';
    }
    
    return (
      <span className={`status-indicator ${badgeClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!user || !user.isAdmin) {
    return <div className="container my-5"><p>Admin access required</p></div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Pet Review</h1>
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
            <div className="filter-buttons" style={{ marginBottom: '20px' }}>
              <h2 style={{ marginBottom: '15px' }}>Pet Sell Post Review</h2>
              <div className="btn-group" role="group">
                <button 
                  type="button" 
                  className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('approved')}
                >
                  Approved
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('rejected')}
                >
                  Rejected
                </button>
                <button 
                  type="button" 
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : pendingPosts.length === 0 ? (
              <div className="no-submissions">
                <i className="fas fa-check-circle"></i>
                <h3>No Pending Pet Submissions</h3>
                <p>There are no pet sell posts waiting for review.</p>
              </div>
            ) : (
              <div className="admin-review-content">
                <div className="submissions-list">
                  <h3>Pending Submissions ({pendingPosts.length})</h3>
                  {pendingPosts.map(post => (
                    <div 
                      key={post._id} 
                      className={`submission-card ${activePost && activePost._id === post._id ? 'active' : ''}`}
                      onClick={() => setActivePost(post)}
                    >
                      <div className="submission-image">
                        <img src={getImageUrl(post.images[0])} alt={post.name} />
                      </div>
                      <div className="submission-details">
                        <h4>{post.name}</h4>
                        <p className="submission-brand">{post.species || 'Not specified'}</p>
                        <p className="submission-category">{post.breed}</p>
                        <p className="submission-price">${post.price.toFixed(2)}</p>
                        <p className="submission-date">
                          Submitted on {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        <p className="submission-user">
                          By: {post.user?.name || 'Unknown User'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="submission-detail">
                  {activePost ? (
                    <>
                      <div className="submission-detail-header">
                        <h3>Review Pet Submission</h3>
                        {reviewStatus.success && (
                          <div className="success-message">Submission processed successfully!</div>
                        )}
                        {reviewStatus.error && (
                          <div className="error-message">{reviewStatus.error}</div>
                        )}
                      </div>
                      
                      <div className="submission-detail-content">
                        <div className="detail-image">
                          <div id="petImagesCarousel" className="carousel slide" data-bs-ride="carousel">
                            <div className="carousel-inner">
                              {activePost.images.map((image, index) => (
                                <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                  <img 
                                    src={getImageUrl(image)} 
                                    className="d-block w-100" 
                                    alt={`${activePost.name} ${index + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                            {activePost.images.length > 1 && (
                              <>
                                <button className="carousel-control-prev" type="button" data-bs-target="#petImagesCarousel" data-bs-slide="prev">
                                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                  <span className="visually-hidden">Previous</span>
                                </button>
                                <button className="carousel-control-next" type="button" data-bs-target="#petImagesCarousel" data-bs-slide="next">
                                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                  <span className="visually-hidden">Next</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="detail-info">
                          <h2>{activePost.name}</h2>
                          <p className="detail-brand"><strong>Species:</strong> {activePost.species || 'Not specified'}</p>
                          <p className="detail-category"><strong>Breed:</strong> {activePost.breed}</p>
                          <p><strong>Age:</strong> {activePost.age} {activePost.ageUnit}</p>
                          <p><strong>Gender:</strong> {activePost.gender.charAt(0).toUpperCase() + activePost.gender.slice(1)}</p>
                          <p className="detail-price"><strong>Price:</strong> ${activePost.price.toFixed(2)}</p>
                          <p><strong>Location:</strong> {activePost.location}</p>
                          <p><strong>Health Status:</strong> {activePost.healthStatus}</p>
                          <p><strong>Vaccination:</strong> {activePost.vaccination || 'Not specified'}</p>
                          <p className="detail-desc"><strong>Description:</strong> {activePost.description}</p>
                          <p className="detail-user">
                            <strong>Submitted by:</strong> {activePost.user?.name || 'Unknown User'}
                          </p>
                          <p className="detail-date">
                            <strong>Submitted on:</strong> {new Date(activePost.createdAt).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="detail-actions">
                          <button 
                            onClick={handleApprove}
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
                      <h3>Select a pet to review</h3>
                      <p>Click on a pet submission from the list to review it.</p>
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

export default AdminPetSellReview; 