import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Adoption() {
  const [adoptionPosts, setAdoptionPosts] = useState([]);
  const [formData, setFormData] = useState({
    petType: 'cat',
    description: '',
    location: '',
    image: null,
  });
  const [message, setMessage] = useState('');
  const [requestedPosts, setRequestedPosts] = useState([]);
  const [loadingRequest, setLoadingRequest] = useState(false);

  // New state for filters
  const [filterPetType, setFilterPetType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const navigate = useNavigate();

  const fetchRequestedPosts = async () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) return;
    const userObj = JSON.parse(loggedInUser);
    try {
      const response = await axios.get(`http://localhost:3000/api/users/${userObj._id}/sent-adoption-requests`);
      const requestedPostIds = response.data.map(req => req.postId);
      setRequestedPosts(requestedPostIds);
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
      // Build query params for filters
      const params = {};
      if (filterPetType) params.petType = filterPetType;
      if (filterLocation) params.location = filterLocation;

      const response = await axios.get('http://localhost:3000/api/adoption', { params });
      setAdoptionPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch adoption posts', error);
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
    setMessage('');
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(loggedInUser);

    if (!formData.image) {
      setMessage('Please select an image.');
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
      setMessage('Adoption post created successfully.');
      setFormData({
        petType: 'cat',
        description: '',
        location: '',
        image: null,
      });
      fetchAdoptionPosts();
    } catch (error) {
      console.error('Failed to create adoption post', error);
      setMessage('Failed to create adoption post.');
    }
  };
  const requestAdoption = async (post) => {
    if (loadingRequest) return;
    setLoadingRequest(true);
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      setLoadingRequest(false);
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(loggedInUser);
    try {
      await axios.post(`http://localhost:3000/api/users/${post.user}/adoption-requests`, {
        requesterId: userObj._id,
        requesterName: userObj.name,
        petType: post.petType,
        description: post.description,
        location: post.location,
        imageUrl: post.imageUrl,
        postId: post._id,
      });
      await fetchRequestedPosts();
    } catch (error) {
      console.error('Failed to send adoption request', error);
    } finally {
      setLoadingRequest(false);
    }
  };

  const hasRequested = (postId) => {
    return requestedPosts.includes(postId);
  };

  const deletePost = async (postId) => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      alert('Please log in to delete posts.');
      return;
    }
    const userObj = JSON.parse(loggedInUser);
    try {
      await axios.delete(`http://localhost:3000/api/adoption/${postId}`, {
        data: { user: userObj.name },
      });
      setAdoptionPosts(adoptionPosts.filter(post => post._id !== postId));
      alert('Post deleted successfully.');
    } catch (error) {
      console.error('Failed to delete post', error);
      alert('Failed to delete post.');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Adoption Posts</h1>
      </header>
      <div className="dashboard-body">
        <nav className="dashboard-sidebar">
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="#marketplace">Marketplace</a></li>
            <li><a href="/profile">Profile</a></li>
            <li><button onClick={() => { localStorage.removeItem('loggedInUser'); navigate('/login'); }} className="logout-button">Logout</button></li>
          </ul>
        </nav>
        <main className="dashboard-main">
          {/* Filter section */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <select
              value={filterPetType}
              onChange={(e) => setFilterPetType(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
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
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flexGrow: 1 }}
            />
            <button
              onClick={fetchAdoptionPosts}
              style={{ padding: '8px 16px', borderRadius: '4px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Apply Filters
            </button>
          </div>
          {message && <p style={{ color: 'green', marginBottom: '15px' }}>{message}</p>}
          <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label>
              Pet Type:
              <select name="petType" value={formData.petType} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
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
                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
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
                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
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
                style={{ marginTop: '5px' }}
              />
            </label>
            <button type="submit" className="twitter-button new-post-button">Create Adoption Post</button>
          </form>
          <div className="feed">
            {adoptionPosts.length === 0 ? (
              <p>No adoption posts available.</p>
            ) : (
              adoptionPosts.map(post => {
                console.log('Rendering post:', post._id, 'userId:', post.userId);
                const loggedInUser = localStorage.getItem('loggedInUser');
                const currentUser = loggedInUser ? JSON.parse(loggedInUser).name : null;
                const showRequestButton = currentUser && currentUser !== post.user;
                return (
                  <div key={post._id} className="tweet" style={{ marginBottom: '20px' }}>
                    <div className="tweet-header">
                      <span className="tweet-user">{post.user}</span>
                      <span className="tweet-timestamp">{new Date(post.timestamp).toLocaleString()}</span>
                    </div>
                    <div><strong>Pet Type:</strong> {post.petType}</div>
                    <div className="tweet-content">{post.description}</div>
                    <div><strong>Location:</strong> {post.location}</div>
                    {post.imageUrl && <img src={`http://localhost:3000${post.imageUrl}`} alt="Pet" style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }} />}
                    {showRequestButton && !hasRequested(post._id) && (
                      <button
                        style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => {
                          console.log('Request Adoption button clicked for post:', post._id);
                          requestAdoption(post);
                        }}
                        disabled={loadingRequest}
                      >
                        Request Adoption
                      </button>
                    )}
                    {showRequestButton && hasRequested(post._id) && (
                      <button
                        style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'not-allowed' }}
                        disabled
                      >
                        Requested
                      </button>
                    )}
                    {post.user === currentUser && (
                      <button
                        style={{ marginTop: '10px', marginLeft: '10px', padding: '8px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => deletePost(post._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Adoption;
