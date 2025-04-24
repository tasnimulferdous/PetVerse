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

  useEffect(() => {
    fetchUsers();
    fetchPosts();
    fetchPendingSubmissions();
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

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:3000/api/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  const navigateToProductReview = () => {
    navigate('/admin/product-review');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={handleLogout}>Logout</button>
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
      </div>
      <SearchBar onSearch={handleSearch} />
      <h2>Registered Users</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {filteredUsers.map(user => (
          <UserCard key={user._id} user={user} onDelete={handleDeleteUser} />
        ))}
      </div>
      <h2>User Posts</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {posts.map(post => (
          <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
