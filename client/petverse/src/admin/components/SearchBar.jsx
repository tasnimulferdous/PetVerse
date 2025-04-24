import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [term, setTerm] = useState('');

  const handleChange = (e) => {
    setTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <input
      type="text"
      placeholder="Search users..."
      value={term}
      onChange={handleChange}
      style={{
        padding: '8px',
        width: '300px',
        marginBottom: '20px',
        borderRadius: '4px',
        border: '1px solid #ccc'
      }}
    />
  );
}

export default SearchBar;
