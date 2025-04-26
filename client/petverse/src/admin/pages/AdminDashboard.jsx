import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserCard from '../components/UserCard';
import PostCard from '../components/PostCard';
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [pendingPetPosts, setPendingPetPosts] = useState(0);

  useEffect(() => {
    fetchUsers();
    fetchPosts();
    fetchPendingSubmissions();
    fetchPendingPetPosts();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/admin/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchPendingSubmissions = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/marketplace/product-submissions`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      const pending = data.filter(sub => sub.status === 'pending').length;
      setPendingSubmissions(pending);
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
    }
  };

  const fetchPendingPetPosts = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/marketplace/admin/pet-sell-posts`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pet submissions');
      }

      const data = await response.json();
      const pending = data.filter(post => post.status === 'pending').length;
      setPendingPetPosts(pending);
    } catch (error) {
      console.error('Error fetching pending pet posts:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their data?')) {
      return;
    }
    try {
      await axios.delete(`http://localhost:3000/api/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      // Also remove posts of deleted user from state
      setPosts(posts.filter(post => post.user !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:3000/api/admin/posts/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Filter users by search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group posts by userId
  const postsByUser = posts.reduce((acc, post) => {
    if (!acc[post.user]) {
      acc[post.user] = [];
    }
    acc[post.user].push(post);
    return acc;
  }, {});

  // Filter posts by search term (search in title or content)
  const filteredPostsByUser = {};
  Object.keys(postsByUser).forEach(userId => {
    const filteredPosts = postsByUser[userId].filter(post =>
      (post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.description && post.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (filteredPosts.length > 0) {
      filteredPostsByUser[userId] = filteredPosts;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  const navigateToProductReview = () => {
    navigate('/admin/product-review');
  };

  const navigateToPetSellReview = () => {
    navigate('/admin/pet-sell-review');
  };

  return (
    <>
      <div style={{ padding: '20px' }}>
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button onClick={handleLogout}>Logout</button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={navigateToProductReview} 
              style={{ 
                backgroundColor: pendingSubmissions > 0 ? '#ff6b6b' : '#4caf50',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Review Product Submissions {pendingSubmissions > 0 && `(${pendingSubmissions})`}
            </button>
            <button 
              onClick={navigateToPetSellReview} 
              style={{ 
                backgroundColor: pendingPetPosts > 0 ? '#ff6b6b' : '#4caf50',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Review Pet Posts {pendingPetPosts > 0 && `(${pendingPetPosts})`}
            </button>
          </div>
        </div>
        <SearchBar onSearch={handleSearch} />
        <h2>Registered Users</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {filteredUsers.map(user => (
            <UserCard key={user._id} user={user} onDelete={handleDeleteUser} />
          ))}
        </div>
        <h2>User Posts</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.keys(filteredPostsByUser).map(userId => (
            <div key={userId} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
  {(() => {
    const user = users.find(u => u._id.toString() === userId);
    return <h3>Posts by {user ? user.name : userId}</h3>;
  })()}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {filteredPostsByUser[userId].map(post => (
                  <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
