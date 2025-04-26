import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { getApiUrl } from './apiConfig';

function SubmitProduct() {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Pet Food',
    description: '',
    price: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'Pet Food',
    'Pet Toys',
    'Pet Accessories',
    'Pet Health',
    'Pet Grooming',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!user) {
        navigate('/login');
        return;
      }

      // Validate price is a number
      if (isNaN(parseFloat(formData.price))) {
        setError('Price must be a valid number');
        setLoading(false);
        return;
      }

      const response = await fetch(getApiUrl('api/marketplace/product-submissions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include' // Important: Include cookies for session auth
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit product');
      }

      setSuccess(true);
      setFormData({
        name: '',
        brand: '',
        category: 'Pet Food',
        description: '',
        price: '',
        image: ''
      });

      setTimeout(() => {
        navigate('/my-submissions');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to submit product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Submit a Product</h1>
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
              <a href="/marketplace">
                <i className="fas fa-shopping-cart" style={{ marginRight: '8px' }}></i>
                <span>Marketplace</span>
              </a>
            </li>
            <li>
              <a href="/my-submissions">
                <i className="fas fa-list" style={{ marginRight: '8px' }}></i>
                <span>My Submissions</span>
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
          <div className="submit-product-container">
            {success ? (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                <h2>Product Submitted Successfully!</h2>
                <p>Your product has been submitted for approval. You will be redirected to your submissions page.</p>
              </div>
            ) : (
              <>
                <h2>Submit a New Product</h2>
                <p className="submission-info">
                  Fill out the form below to submit a product to the marketplace. 
                  Your submission will be reviewed by our administrators.
                </p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="submit-product-form">
                  <div className="form-group">
                    <label htmlFor="name">Product Name*</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="brand">Brand*</label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      required
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="category">Category*</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="form-control"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description*</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="form-control"
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="price">Price (TK)*</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0.01"
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="image">Image URL*</label>
                    <input
                      type="url"
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="https://example.com/image.jpg"
                    />
                    <small className="form-text">
                      Enter a URL to an image of the product. We recommend using services like Unsplash or Imgur.
                    </small>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Product'}
                  </button>
                </form>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SubmitProduct; 