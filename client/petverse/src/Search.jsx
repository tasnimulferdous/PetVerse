import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { getApiUrl } from './apiConfig';

function Search() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    fetchPosts();
  }, [navigate]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      setFilteredPosts(
        posts.filter(post => post.content.toLowerCase().includes(lowerSearch))
      );
    }
  }, [searchTerm, posts]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(getApiUrl('api/posts'));
      setPosts(response.data);
      setFilteredPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Search Posts</h1>
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
              <a href="/adoption">
                <i className="fas fa-paw" style={{ marginRight: '8px' }}></i>
                <span>Adoption</span>
              </a>
            </li>
            <li>
              <a href="/marketplace">
                <i className="fas fa-shopping-cart" style={{ marginRight: '8px' }}></i>
                <span>Marketplace</span>
              </a>
            </li>
            <li>
              <a href="/notifications">
                <i className="fas fa-bell" style={{ marginRight: '8px' }}></i>
                <span>Notification</span>
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
          <div className="search-page-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-results">
              {filteredPosts.length === 0 ? (
                <p className="no-results">No posts found.</p>
              ) : (
                filteredPosts.map(post => (
                  <div key={post._id} className="search-result-item">
                    <div className="search-result-user">{post.user}</div>
                    <div className="search-result-content">{post.content}</div>
                    <div className="search-result-timestamp">{new Date(post.timestamp).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Search;
