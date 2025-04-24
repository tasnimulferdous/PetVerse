import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { getApiUrl } from './apiConfig';
import { handleLogout } from './utils/auth';

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [commentInputs, setCommentInputs] = useState({}); // to hold comment input per post
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  const formRef = useRef(null);
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

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    } else {
      setNewImage(null);
    }
  };

  const handleNewPostSubmit = async (e) => {
    e.preventDefault();
    if (newPost.trim() === '') return;

    try {
      const formData = new FormData();
      formData.append('user', currentUser);
      formData.append('content', newPost);
      if (newImage) {
        formData.append('image', newImage);
      }

      const response = await axios.post(getApiUrl('api/posts'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPosts([response.data, ...posts]);
      setNewPost('');
      setNewImage(null);
      if (formRef.current) {
        formRef.current.reset();
      }
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

  const handleEditClick = (post) => {
    setEditingPostId(post._id);
    setEditContent(post.content);
    setEditImage(null);
  };

  const handleEditContentChange = (e) => {
    setEditContent(e.target.value);
  };

  const handleEditImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditImage(e.target.files[0]);
    } else {
      setEditImage(null);
    }
  };

  const handleEditCancel = () => {
    setEditingPostId(null);
    setEditContent('');
    setEditImage(null);
  };

  const handleEditSubmit = async (postId) => {
    if (editContent.trim() === '') return;

    try {
      const formData = new FormData();
      formData.append('user', currentUser);
      formData.append('content', editContent);
      if (editImage) {
        formData.append('image', editImage);
      }

      const response = await axios.put(getApiUrl(`api/posts/${postId}`), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPosts(posts.map(post => (post._id === postId ? response.data : post)));
      setEditingPostId(null);
      setEditContent('');
      setEditImage(null);
    } catch (error) {
      console.error('Failed to update post', error);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(getApiUrl(`api/posts/${postId}`), { data: { user: currentUser } });
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Failed to delete post', error);
    }
  };

  // Comment edit handlers
  const handleCommentEditClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentContent(comment.content);
  };

  const handleEditCommentContentChange = (e) => {
    setEditCommentContent(e.target.value);
  };

  const handleEditCommentCancel = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleEditCommentSubmit = async (postId, commentId) => {
    if (editCommentContent.trim() === '') return;

    try {
      const response = await axios.put(getApiUrl(`api/posts/${postId}/comment/${commentId}`), {
        user: currentUser,
        content: editCommentContent,
      });
      setPosts(posts.map(post => (post._id === postId ? response.data : post)));
      setEditingCommentId(null);
      setEditCommentContent('');
    } catch (error) {
      console.error('Failed to update comment', error);
    }
  };

const handleDeleteComment = async (postId, commentId) => {
  console.log('Deleting comment with id:', commentId);
  if (!window.confirm('Are you sure you want to delete this comment?')) return;

  try {
    await axios.delete(getApiUrl(`api/posts/${postId}/comment/${commentId}`), { data: { user: currentUser } });
    setPosts(posts.map(post => {
      if (post._id === postId) {
        return {
          ...post,
          comments: post.comments.filter(comment => comment._id !== commentId),
        };
      }
      return post;
    }));
  } catch (error) {
    console.error('Failed to delete comment', error);
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
          <form className="new-post-form" onSubmit={handleNewPostSubmit} ref={formRef}>
            <textarea
              className="new-post-textarea"
              placeholder="What's happening?"
              value={newPost}
              onChange={handleNewPostChange}
              maxLength={280}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="new-post-image-input"
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
                {editingPostId === post._id ? (
                  <div className="edit-post">
                    <textarea
                      className="edit-post-textarea"
                      value={editContent}
                      onChange={handleEditContentChange}
                      maxLength={280}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="edit-post-image-input"
                    />
                    <button onClick={() => handleEditSubmit(post._id)} className="save-button">Save</button>
                    <button onClick={handleEditCancel} className="cancel-button">Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="tweet-content">{post.content}</div>
                    {post.image && (
                      <div className="tweet-image">
                        <img src={`${getApiUrl('uploads/')}${post.image}`} alt="Post" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                      </div>
                    )}
                    {post.user === currentUser && (
                      <div className="post-actions">
                        <button onClick={() => handleEditClick(post)} className="edit-button">Edit</button>
                        <button onClick={() => handleDelete(post._id)} className="delete-button">Delete</button>
                      </div>
                    )}
                  </>
                )}
                <div className="tweet-actions">
                  <button onClick={() => handleLike(post._id)} className="like-button">
                    {post.likes && post.likes.includes(currentUser) ? 'Unlike' : 'Like'} ({post.likes ? post.likes.length : 0})
                  </button>
                </div>
                <div className="comments-section">
                  <h4>Comments</h4>
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <div key={comment._id} className="comment">
                        <strong>{comment.user}:</strong>
                        {editingCommentId === comment._id ? (
                          <>
                            <input
                              type="text"
                              value={editCommentContent}
                              onChange={handleEditCommentContentChange}
                              maxLength={280}
                              className="edit-comment-input"
                            />
                            <button onClick={() => handleEditCommentSubmit(post._id, comment._id)} className="save-comment-button">Save</button>
                            <button onClick={handleEditCommentCancel} className="cancel-comment-button">Cancel</button>
                          </>
                        ) : (
                          <>
                            <span> {comment.content} </span>
{comment.user === currentUser && (
  <span className="comment-actions">
    <button onClick={() => handleCommentEditClick(comment)} className="edit-comment-button small-button">Edit</button>
  </span>
)}
                          </>
                        )}
                        <em> ({new Date(comment.timestamp).toLocaleString()})</em>
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
