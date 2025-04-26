import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Adoption.css';
import { getApiUrl, API_URL } from './apiConfig';

function Adoption() {
  const [adoptionPosts, setAdoptionPosts] = useState([]);
  const [formData, setFormData] = useState({
    petType: 'cat',
    description: '',
    location: '',
    image: null,
  });
  const [requestedPosts, setRequestedPosts] = useState(() => {
    // Initialize from localStorage if available
    const savedRequests = localStorage.getItem('requestedAdoptionPosts');
    return savedRequests ? JSON.parse(savedRequests) : [];
  });
  const [loadingRequests, setLoadingRequests] = useState({});
  const [requestDescriptions, setRequestDescriptions] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);

  // New state for filters
  const [filterPetType, setFilterPetType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const navigate = useNavigate();

  // Update localStorage whenever requestedPosts changes
  useEffect(() => {
    localStorage.setItem('requestedAdoptionPosts', JSON.stringify(requestedPosts));
  }, [requestedPosts]);

  const fetchRequestedPosts = async () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) return;
    const userObj = JSON.parse(loggedInUser);
    try {
      const response = await axios.get(`http://localhost:3000/api/users/${userObj._id}/sent-adoption-requests`);
      const requestedPostIds = response.data.map(req => req.postId);
      
      // Merge with existing requested posts from localStorage
      setRequestedPosts(prev => {
        const combined = [...new Set([...prev, ...requestedPostIds])];
        localStorage.setItem('requestedAdoptionPosts', JSON.stringify(combined));
        return combined;
      });
    } catch (error) {
      console.error('Failed to fetch requested posts', error);
    }
  };

  useEffect(() => {
    fetchRequestedPosts();
  }, []);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    fetchAdoptionPosts();
  }, [navigate]);

  const fetchAdoptionPosts = async () => {
    try {
      console.log('Fetching adoption posts...');
      // Build query params for filters
      const params = {};
      if (filterPetType) params.petType = filterPetType;
      if (filterLocation) params.location = filterLocation;

      console.log('Request params:', params);
      const response = await axios.get('http://localhost:3000/api/adoption', { params });
      console.log('Response data:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response format:', response.data);
        return;
      }
      
      setAdoptionPosts(response.data);
      console.log('Adoption posts updated:', response.data.length, 'posts');
    } catch (error) {
      console.error('Failed to fetch adoption posts:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(loggedInUser);

    if (!formData.image) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const data = new FormData();
    data.append('user', userObj.name);
    data.append('petType', formData.petType);
    data.append('description', formData.description);
    data.append('location', formData.location);
    data.append('image', formData.image);

    try {
      const response = await axios.post('http://localhost:3000/api/adoption', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMessage('Post created successfully!');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
      setFormData({
        petType: 'cat',
        description: '',
        location: '',
        image: null,
      });
      fetchAdoptionPosts();
    } catch (error) {
      console.error('Failed to create adoption post', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };
  
  const handleRequestDescriptionChange = (postId, value) => {
    setRequestDescriptions(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const hasRequested = (postId) => {
    return requestedPosts.includes(postId);
  };

  const requestAdoption = async (post) => {
    const postId = post._id;
    if (loadingRequests[postId] || hasRequested(postId)) return;
    
    setLoadingRequests(prev => ({
      ...prev,
      [postId]: true
    }));

    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      setLoadingRequests(prev => ({
        ...prev,
        [postId]: false
      }));
      navigate('/login');
      return;
    }

    const userObj = JSON.parse(loggedInUser);
    try {
      await axios.post(`http://localhost:3000/api/adoption/${postId}/request`, {
        requesterId: userObj._id,
        requesterName: userObj.name,
        petType: post.petType,
        description: requestDescriptions[postId] || '',
        location: post.location,
        imageUrl: post.imageUrl,
        requestDescription: requestDescriptions[postId] || '',
      });
      
      // Add to requested posts and update localStorage
      setRequestedPosts(prev => {
        const updated = [...prev, postId];
        localStorage.setItem('requestedAdoptionPosts', JSON.stringify(updated));
        return updated;
      });
      
      // Clear the description for this post
      setRequestDescriptions(prev => {
        const newState = { ...prev };
        delete newState[postId];
        return newState;
      });

      setSuccessMessage('Adoption request sent successfully!');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to send adoption request', error);
      setSuccessMessage('Failed to send adoption request. Please try again.');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } finally {
      setLoadingRequests(prev => ({
        ...prev,
        [postId]: false
      }));
    }
  };

  const deletePost = async (postId) => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    const userObj = JSON.parse(loggedInUser);
    try {
      await axios.delete(`http://localhost:3000/api/adoption/${postId}`, {
        data: { user: userObj.name },
      });
      setAdoptionPosts(adoptionPosts.filter(post => post._id !== postId));
      setSuccessMessage('Post deleted successfully!');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to delete post', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <div className="adoption-page-wrapper">
      {showSuccess && (
        <div className="success-message-adoption-post">
          <i className="fas fa-check-circle"></i>
          <span>{successMessage}</span>
        </div>
      )}
      {showError && (
        <div className="success-message-adoption-post" style={{ backgroundColor: '#ff6b6b' }}>
          <i className="fas fa-exclamation-circle"></i>
          <span>Please select an image</span>
        </div>
      )}
      <div className="adoption-sidebar">
        <div className="petverse-logo-container">
          <h1 className="petverse-logo">PetVerse</h1>
        </div>
        <nav>
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
                <i className="fas fa-paw" style={{ marginRight: '8px' }}></i>
                <span>Pet Marketplace</span>
              </a>
            </li>
            <li>
              <a href="/adopt-message">
                <i className="fas fa-comments" style={{ marginRight: '8px' }}></i>
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
      </div>
      <div className="adoption-content">
        <div className="adoption-hero">
          <img 
            src="images/adoption-heading.jpg" 
            // alt="Find Your Best Buddy"
            className="adoption-hero-image"
          />
        </div>
        <span className="decorative-text find">FIND</span>
        <span className="decorative-text your">YOUR</span>
        <span className="decorative-text best">BEST</span>
        <span className="decorative-text buddy">BUDDY</span>
        <div className="adoption-form-container">
          <form onSubmit={handleSubmit} className="adoption-form">
            <h2>Create Adoption Post</h2>
            <label>
              Pet Type:
              <select name="petType" value={formData.petType} onChange={handleChange} required className="form-select">
                <option value="cat">Cat</option>
                <option value="dog">Dog</option>
                <option value="bird">Bird</option>
                <option value="fish">Fish</option>
                <option value="others">Others</option>
              </select>
            </label>
            <label>
              Description:
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                maxLength={500}
                className="form-textarea"
              />
            </label>
            <label>
              Location:
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="form-input"
              />
            </label>
            <label>
              Image:
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                required
                className="form-file-input"
              />
            </label>
            <button type="submit" className="twitter-button new-post-button">Create Adoption Post</button>
          </form>
        </div>
        <div className="adoption-posts-container">
          <h2>Available Pets for Adoption</h2>
          <div className="filter-container">
            <select
              value={filterPetType}
              onChange={(e) => setFilterPetType(e.target.value)}
              className="filter-select"
            >
              <option value="">All Pet Types</option>
              <option value="cat">Cat</option>
              <option value="dog">Dog</option>
              <option value="bird">Bird</option>
              <option value="fish">Fish</option>
              <option value="others">Others</option>
            </select>
            <input
              type="text"
              placeholder="Filter by Location"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="filter-input"
            />
            <button
              onClick={fetchAdoptionPosts}
              className="filter-button"
            >
              Apply Filters
            </button>
          </div>
          <div className="feed">
            {adoptionPosts.length === 0 ? (
              <p>No adoption posts available.</p>
            ) : (
              adoptionPosts.map(post => {
                const loggedInUser = localStorage.getItem('loggedInUser');
                const currentUser = loggedInUser ? JSON.parse(loggedInUser).name : null;
                const showRequestButton = currentUser && currentUser !== post.user;
                const isRequested = hasRequested(post._id);
                
                return (
                  <div key={post._id} className="tweet adoption-post">
                    <div className="tweet-header">
                      <span className="tweet-user">{post.user}</span>
                      <span className="tweet-timestamp">{new Date(post.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="pet-type"><strong>Pet Type:</strong> {post.petType}</div>
                    <div className="tweet-content">{post.description}</div>
                    <div className="pet-location"><strong>Location:</strong> {post.location}</div>
                    {post.imageUrl && <img src={`http://localhost:3000${post.imageUrl}`} alt="Pet" className="pet-image" />}
                    <div className="post-actions">
                      {showRequestButton && !isRequested && (
                        <div className="request-form">
                          <textarea
                            placeholder="Tell the owner why you want to adopt this pet..."
                            value={requestDescriptions[post._id] || ''}
                            onChange={(e) => handleRequestDescriptionChange(post._id, e.target.value)}
                            className="request-description"
                            required
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              requestAdoption(post);
                            }}
                            disabled={loadingRequests[post._id] || !requestDescriptions[post._id]?.trim()}
                            className="request-button"
                          >
                            {loadingRequests[post._id] ? 'Requesting...' : 'Request Adoption'}
                          </button>
                        </div>
                      )}
                      {showRequestButton && isRequested && (
                        <button className="requested-button" disabled>
                          Requested
                        </button>
                      )}
                      {post.user === currentUser && (
                        <button
                          className="delete-button"
                          onClick={() => deletePost(post._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adoption;
