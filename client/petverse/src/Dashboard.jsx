import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { getApiUrl } from './apiConfig';
import { handleLogout } from './utils/auth';

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [commentInputs, setCommentInputs] = useState({}); // to hold comment input per post
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userObj = JSON.parse(loggedInUser);
      setCurrentUser(userObj.name);
    } else {
      navigate('/login');
    }
    fetchPosts();
  }, []);

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

  const handleNewPostChange = (e) => {
    setNewPost(e.target.value);
  };

  const handleNewPostSubmit = async (e) => {
    e.preventDefault();
    if (newPost.trim() === '') return;

    try {
      const response = await axios.post(getApiUrl('api/posts'), {
        user: currentUser,
        content: newPost,
      });
      setPosts([response.data, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Failed to create post', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(getApiUrl(`api/posts/${postId}/like`), {
        user: currentUser,
      });
      setPosts(posts.map(post => (post._id === postId ? response.data : post)));
    } catch (error) {
      console.error('Failed to like post', error);
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentContent = commentInputs[postId];
    if (!commentContent || commentContent.trim() === '') return;

    try {
      const response = await axios.post(getApiUrl(`api/posts/${postId}/comment`), {
        user: currentUser,
        content: commentContent,
      });
      setPosts(posts.map(post => (post._id === postId ? response.data : post)));
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  const logout = () => {
    return handleLogout(navigate);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>PetVerse</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </header>
      <div className="dashboard-body">
        <nav className="dashboard-sidebar">
          <ul>
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
              <a href="/pet-marketplace">
                <i className="fas fa-dog" style={{ marginRight: '8px' }}></i>
                <span>Pet Marketplace</span>
              </a>
            </li>
            <li>
              <a href="/submit-pet-sell-post">
                <i className="fas fa-plus-circle" style={{ marginRight: '8px' }}></i>
                <span>Sell a Pet</span>
              </a>
            </li>
            <li>
              <a href="/my-pet-sell-posts">
                <i className="fas fa-list" style={{ marginRight: '8px' }}></i>
                <span>My Pet Posts</span>
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
              <button onClick={logout} className="logout-button">
                <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
        <main className="dashboard-main">
          <form className="new-post-form" onSubmit={handleNewPostSubmit}>
            <textarea
              className="new-post-textarea"
              placeholder="What's happening?"
              value={newPost}
              onChange={handleNewPostChange}
              maxLength={280}
            />
            <button type="submit" className="twitter-button new-post-button">Post</button>
          </form>
          <div className="feed">
            {filteredPosts.map(post => (
              <div key={post._id} className="tweet">
                <div className="tweet-header">
                  <span className="tweet-user">{post.user}</span>
                  <span className="tweet-timestamp">{new Date(post.timestamp).toLocaleString()}</span>
                </div>
                <div className="tweet-content">{post.content}</div>
                <div className="tweet-actions">
                  <button onClick={() => handleLike(post._id)} className="like-button">
                    {post.likes && post.likes.includes(currentUser) ? 'Unlike' : 'Like'} ({post.likes ? post.likes.length : 0})
                  </button>
                </div>
                <div className="comments-section">
                  <h4>Comments</h4>
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment, index) => (
                      <div key={index} className="comment">
                        <strong>{comment.user}:</strong> {comment.content} <em>({new Date(comment.timestamp).toLocaleString()})</em>
                      </div>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )}
                  <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="comment-form">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInputs[post._id] || ''}
                      onChange={(e) => handleCommentChange(post._id, e.target.value)}
                      maxLength={280}
                      className="comment-input"
                    />
                    <button type="submit" className="comment-button">Comment</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
