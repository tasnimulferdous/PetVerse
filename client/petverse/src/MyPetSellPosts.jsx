import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MY_PET_SELL_POSTS_URL, PET_SELL_POSTS_URL, getImageUrl } from './apiConfig';
import { toast } from 'react-toastify';
import './App.css';

function MyPetSellPosts() {
  const navigate = useNavigate();
  const [petPosts, setPetPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!userData) {
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

  useEffect(() => {
    const fetchPetPosts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await axios.get(MY_PET_SELL_POSTS_URL, { withCredentials: true });
        setPetPosts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching pet posts:', err);
        setError('Failed to fetch your pet sell posts. Please try again later.');
        toast.error('Failed to fetch your pet sell posts');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPetPosts();
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pet sell post?')) {
      try {
        await axios.delete(`${PET_SELL_POSTS_URL}/${id}`, { withCredentials: true });
        setPetPosts(petPosts.filter(post => post._id !== id));
        toast.success('Pet sell post deleted successfully');
      } catch (error) {
        console.error('Error deleting pet sell post:', error);
        toast.error('Failed to delete pet sell post');
      }
    }
  };

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
        badgeClass = 'status-pending';
    }
    
    return (
      <div className={`status-indicator ${badgeClass}`}>
        {getStatusIcon(status)}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <i className="fas fa-check-circle"></i>;
      case 'rejected': return <i className="fas fa-times-circle"></i>;
      default: return <i className="fas fa-clock"></i>;
    }
  };

  if (!user) {
    return <div className="container my-5"><p>Please log in to view your pet sell posts</p></div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>My Pet Sell Posts</h1>
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
              <a href="/pet-marketplace">
                <i className="fas fa-dog" style={{ marginRight: '8px' }}></i>
                <span>Pet Marketplace</span>
              </a>
            </li>
            <li>
              <a href="/submit-pet-sell-post">
                <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                <span>Submit Pet</span>
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
              <h2>My Pet Sell Posts</h2>
              <button 
                onClick={() => navigate('/submit-pet-sell-post')} 
                className="new-submission-button"
              >
                <i className="fas fa-plus"></i> Submit New Pet
              </button>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : petPosts.length === 0 ? (
              <div className="no-submissions">
                <i className="fas fa-inbox"></i>
                <h3>No Pet Sell Posts Yet</h3>
                <p>You haven't submitted any pets for sale yet.</p>
                <button 
                  onClick={() => navigate('/submit-pet-sell-post')} 
                  className="submit-now-button"
                >
                  Submit a Pet Now
                </button>
              </div>
            ) : (
              <div className="submissions-list">
                {petPosts.map(post => (
                  <div key={post._id} className="submission-card">
                    <div className="submission-image">
                      <img src={getImageUrl(post.images[0])} alt={post.name} />
                    </div>
                    <div className="submission-details">
                      <h3>{post.name}</h3>
                      <p className="submission-brand">
                        <span className="badge">{post.species || 'Other'}</span> • 
                        {post.breed} • {post.age} {post.ageUnit} • {post.gender.charAt(0).toUpperCase() + post.gender.slice(1)}
                      </p>
                      <p className="submission-price">${post.price.toFixed(2)}</p>
                      <p className="submission-category">{post.location}</p>
                      <p className="submission-date">
                        Submitted on {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`submission-status ${post.status === 'approved' ? 'status-approved' : post.status === 'rejected' ? 'status-rejected' : 'status-pending'}`}>
                      {getStatusBadge(post.status)}
                      {post.status === 'rejected' && post.rejectionReason && (
                        <div className="rejection-reason">
                          <p><strong>Reason:</strong> {post.rejectionReason}</p>
                        </div>
                      )}
                      <div className="submission-actions">
                        {post.status !== 'approved' && (
                          <button
                            onClick={() => navigate(`/edit-pet-sell-post/${post._id}`)}
                            className="edit-button"
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="delete-button"
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
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

export default MyPetSellPosts; 