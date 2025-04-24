import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { getApiUrl, getImageUrl } from './apiConfig';
import { toast } from 'react-toastify';

function AdminPetSellPosts() {
  const [petPosts, setPetPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    const fetchPetPosts = async () => {
      try {
        console.log("tada");
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

        const response = await fetch(getApiUrl('api/marketplace/admin/pet-sell-posts'), {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pet sell posts');
        }

        const data = await response.json();
        setPetPosts(data);
      } catch (error) {
        setError(error.message || 'Failed to fetch pet sell posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPetPosts();
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

  const handleApprove = async (postId) => {
    try {
      setLoading(true);
      const response = await axios.put(
        getApiUrl(`api/marketplace/pet-sell-posts/${postId}/review`), 
        { status: 'approved' },
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (response.status === 200) {
        // Update the local state to reflect the change
        setPetPosts(petPosts.map(post => 
          post._id === postId ? { ...post, status: 'approved' } : post
        ));
        toast.success('Pet sell post approved successfully');
      }
    } catch (error) {
      toast.error('Failed to approve pet sell post');
      console.error('Error approving pet sell post:', error);
    } finally {
      setLoading(false);
    }
  };

  const openRejectModal = (post) => {
    setSelectedPost(post);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setSelectedPost(null);
    setRejectionReason('');
    setShowRejectModal(false);
  };

  const handleReject = async () => {
    if (!selectedPost) return;
    
    try {
      setLoading(true);
      const response = await axios.put(
        getApiUrl(`api/marketplace/pet-sell-posts/${selectedPost._id}/review`), 
        { 
          status: 'rejected',
          rejectionReason: rejectionReason 
        },
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (response.status === 200) {
        // Update the local state to reflect the change
        setPetPosts(petPosts.map(post => 
          post._id === selectedPost._id 
            ? { ...post, status: 'rejected', rejectionReason: rejectionReason } 
            : post
        ));
        toast.success('Pet sell post rejected');
        closeRejectModal();
      }
    } catch (error) {
      toast.error('Failed to reject pet sell post');
      console.error('Error rejecting pet sell post:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewPetDetails = (postId) => {
    navigate(`/pet-sell-post/${postId}`);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Pet Sell Posts Review</h1>
      </header>
      
      <div className="dashboard-body">
        <nav className="dashboard-sidebar">
          <ul>
            <li>
              <a href="/admin-dashboard">
                <i className="fas fa-home" style={{ marginRight: '8px' }}></i>
                <span>Admin Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/admin-products">
                <i className="fas fa-shopping-cart" style={{ marginRight: '8px' }}></i>
                <span>Products</span>
              </a>
            </li>
            <li>
              <a href="/admin-pet-sell-posts" className="active">
                <i className="fas fa-paw" style={{ marginRight: '8px' }}></i>
                <span>Pet Sell Posts</span>
              </a>
            </li>
            <li>
              <a href="/admin-users">
                <i className="fas fa-users" style={{ marginRight: '8px' }}></i>
                <span>Users</span>
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
              <h2>Pet Sell Posts for Review</h2>
              <div className="filter-container">
                <select className="status-filter">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : petPosts.length === 0 ? (
              <div className="no-submissions">
                <i className="fas fa-inbox"></i>
                <h3>No Pet Sell Posts</h3>
                <p>There are currently no pet sell posts to review.</p>
              </div>
            ) : (
              <div className="submissions-list">
                {petPosts.map(post => (
                  <div key={post._id} className="submission-card">
                    <div className="submission-image">
                      {post.images && post.images.length > 0 ? (
                        <img src={getImageUrl(post.images[0])} alt={post.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="submission-details">
                      <h3>{post.name}</h3>
                      <p className="submission-brand">Breed: {post.breed}</p>
                      <p className="submission-category">
                        Age: {post.age} {post.ageUnit} | Gender: {post.gender}
                      </p>
                      <p className="submission-price">${post.price.toFixed(2)}</p>
                      <p className="submission-date">
                        Submitted on {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <button 
                        onClick={() => viewPetDetails(post._id)} 
                        className="view-details-button"
                      >
                        View Details
                      </button>
                    </div>
                    <div className={`submission-status ${getStatusClass(post.status)}`}>
                      <div className="status-indicator">
                        {getStatusIcon(post.status)}
                        <span>{post.status.charAt(0).toUpperCase() + post.status.slice(1)}</span>
                      </div>
                      {post.status === 'rejected' && post.rejectionReason && (
                        <div className="rejection-reason">
                          <p><strong>Reason:</strong> {post.rejectionReason}</p>
                        </div>
                      )}
                      {post.status === 'pending' && (
                        <div className="action-buttons">
                          <button 
                            className="approve-button"
                            onClick={() => handleApprove(post._id)}
                            disabled={loading}
                          >
                            Approve
                          </button>
                          <button 
                            className="reject-button"
                            onClick={() => openRejectModal(post)}
                            disabled={loading}
                          >
                            Reject
                          </button>
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

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Reject Pet Sell Post</h3>
              <button onClick={closeRejectModal} className="close-modal-button">×</button>
            </div>
            <div className="modal-body">
              <p>You are rejecting the pet sell post for: <strong>{selectedPost?.name}</strong></p>
              <div className="form-group">
                <label htmlFor="rejectionReason">Reason for Rejection:</label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="form-control"
                  placeholder="Provide a reason for rejection"
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeRejectModal} className="cancel-button">Cancel</button>
              <button 
                onClick={handleReject} 
                className="reject-button"
                disabled={!rejectionReason.trim() || loading}
              >
                {loading ? 'Submitting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPetSellPosts; 