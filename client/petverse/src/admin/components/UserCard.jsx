import React from 'react';

function UserCard({ user, onDelete }) {
  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this user and all their data?')) {
      onDelete(user._id);
    }
  };

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      width: '200px',
      boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
    }}>
      <h3>{user.name}</h3>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <p>Favorite Pet: {user.favouritePet}</p>
      <button onClick={handleDeleteClick} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>
        Delete User
      </button>
    </div>
  );
}

export default UserCard;
