import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Search() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
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
      const response = await axios.get('http://localhost:3000/api/posts');
      setPosts(response.data);
      setFilteredPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    }
  };

  return (
    <div className="search-container" style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Search Posts</h2>
      <input
        type="text"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '10px', fontSize: '1rem', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <div className="search-results">
        {filteredPosts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          filteredPosts.map(post => (
            <div key={post._id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
              <div style={{ fontWeight: 'bold' }}>{post.user}</div>
              <div>{post.content}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(post.timestamp).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Search;
