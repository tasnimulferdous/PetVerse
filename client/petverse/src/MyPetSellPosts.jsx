import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MY_PET_SELL_POSTS_URL, PET_SELL_POSTS_URL, getImageUrl } from './apiConfig';
import { toast } from 'react-toastify';

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
        badgeClass = 'bg-warning';
        break;
      case 'approved':
        badgeClass = 'bg-success';
        break;
      case 'rejected':
        badgeClass = 'bg-danger';
        break;
      default:
        badgeClass = 'bg-secondary';
    }
    
    return (
      <span className={`badge ${badgeClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!user) {
    return <div className="container my-5"><p>Please log in to view your pet sell posts</p></div>;
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Pet Sell Posts</h2>
        <Link to="/submit-pet-sell-post" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Submit New Pet
        </Link>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : petPosts.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <p className="mb-3">You haven't submitted any pets for sale yet.</p>
            <Link to="/submit-pet-sell-post" className="btn btn-primary">
              Submit Your First Pet
            </Link>
          </div>
        </div>
      ) : (
        <div className="row">
          {petPosts.map((post) => (
            <div key={post._id} className="col-md-6 col-xl-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="position-relative">
                  <img
                    src={getImageUrl(post.images[0])}
                    className="card-img-top"
                    alt={post.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="position-absolute top-0 end-0 m-2">
                    {getStatusBadge(post.status)}
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{post.name}</h5>
                  <p className="card-text text-muted mb-1">
                    <span className="badge bg-info me-1">{post.species || 'Other'}</span>
                    {post.breed} • {post.age} {post.ageUnit} • {post.gender.charAt(0).toUpperCase() + post.gender.slice(1)}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Price:</strong> ${post.price.toFixed(2)}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Location:</strong> {post.location}
                  </p>
                  <p className="card-text text-truncate">
                    <small>{post.description}</small>
                  </p>
                  
                  {post.status === 'rejected' && post.rejectionReason && (
                    <div className="alert alert-danger py-2 mt-2" role="alert">
                      <small><strong>Rejection reason:</strong> {post.rejectionReason}</small>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <p className="card-text">
                      <small className="text-muted">
                        Submitted on {new Date(post.createdAt).toLocaleDateString()}
                      </small>
                    </p>
                  </div>
                </div>
                <div className="card-footer bg-white d-flex justify-content-between">
                  {post.status !== 'approved' && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/edit-pet-sell-post/${post._id}`)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(post._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPetSellPosts; 