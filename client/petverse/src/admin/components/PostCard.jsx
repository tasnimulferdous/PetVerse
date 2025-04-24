import React from 'react';

function PostCard({ post, onDelete }) {
  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      width: '300px',
      boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
    }}>
      <h3>{post.title || 'Untitled Post'}</h3>
      <p>By: {post.user}</p>
      <p>{post.content || post.description || 'No content available'}</p>
      <button onClick={() => onDelete(post._id)} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>
        Delete Post
      </button>
    </div>
  );
}

export default PostCard;
