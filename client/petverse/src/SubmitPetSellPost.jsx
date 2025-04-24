import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PET_SELL_POSTS_URL, getApiUrl, getImageUrl } from './apiConfig';
import { toast } from 'react-toastify';
import './App.css';

function SubmitPetSellPost() {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    ageUnit: 'months',
    gender: 'male',
    description: '',
    price: '',
    location: '',
    healthStatus: '',
    vaccination: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 5 images
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    
    setImages([...images, ...files]);
    
    // Generate previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Pet name is required');
      return false;
    }
    if (!formData.species.trim()) {
      setError('Pet species is required');
      return false;
    }
    if (!formData.breed.trim()) {
      setError('Breed is required');
      return false;
    }
    if (!formData.age || formData.age <= 0) {
      setError('Valid age is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setError('Valid price is required');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    if (!formData.healthStatus.trim()) {
      setError('Health status is required');
      return false;
    }
    if (images.length === 0) {
      setError('At least one image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    try {
      const petFormData = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        petFormData.append(key, formData[key]);
      });
      
      // Append images
      images.forEach(image => {
        petFormData.append('images', image);
      });
      
      const response = await axios.post(getApiUrl('api/marketplace/pet-sell-posts'), petFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      if (response.status === 201) {
        setSuccess(true);
        toast.success('Your pet sell post has been submitted for approval');
        
        setTimeout(() => {
          navigate('/my-pet-sell-posts');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting pet sell post:', error);
      setError(error.response?.data?.message || 'Failed to submit pet sell post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Submit a Pet for Sale</h1>
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
              <a href="/my-pet-sell-posts">
                <i className="fas fa-list" style={{ marginRight: '8px' }}></i>
                <span>My Pet Listings</span>
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
                <h2>Pet Listing Submitted Successfully!</h2>
                <p>Your pet listing has been submitted for approval. You will be redirected to your submissions page.</p>
              </div>
            ) : (
              <>
                <h2>Submit a Pet for Sale</h2>
                <p className="submission-info">
                  Fill out the form below to submit a pet for sale. 
                  Your submission will be reviewed by our administrators.
                </p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="submit-product-form">
                  <div className="form-group">
                    <label htmlFor="name">Pet Name*</label>
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
                    <label htmlFor="species">Pet Species*</label>
                    <input
                      type="text"
                      id="species"
                      name="species"
                      value={formData.species}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="e.g., Dog, Cat, Bird, Fish, etc."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="breed">Breed*</label>
                    <input
                      type="text"
                      id="breed"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                      required
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group" style={{ width: '30%', marginRight: '5%' }}>
                      <label htmlFor="age">Age*</label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        min="0"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group" style={{ width: '30%', marginRight: '5%' }}>
                      <label htmlFor="ageUnit">Age Unit*</label>
                      <select
                        id="ageUnit"
                        name="ageUnit"
                        value={formData.ageUnit}
                        onChange={handleChange}
                        required
                        className="form-control"
                      >
                        <option value="days">Days</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>
                    
                    <div className="form-group" style={{ width: '30%' }}>
                      <label htmlFor="gender">Gender*</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="form-control"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
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
                  
                  <div className="form-row">
                    <div className="form-group" style={{ width: '47.5%', marginRight: '5%' }}>
                      <label htmlFor="price">Price ($)*</label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group" style={{ width: '47.5%' }}>
                      <label htmlFor="location">Location*</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group" style={{ width: '47.5%', marginRight: '5%' }}>
                      <label htmlFor="healthStatus">Health Status*</label>
                      <input
                        type="text"
                        id="healthStatus"
                        name="healthStatus"
                        value={formData.healthStatus}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="E.g., Excellent, Good, etc."
                      />
                    </div>
                    
                    <div className="form-group" style={{ width: '47.5%' }}>
                      <label htmlFor="vaccination">Vaccination Details</label>
                      <input
                        type="text"
                        id="vaccination"
                        name="vaccination"
                        value={formData.vaccination}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="E.g., Up to date, Not vaccinated, etc."
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="images">Pet Images* (Max 5)</label>
                    <input
                      type="file"
                      id="images"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="form-control"
                    />
                    <small className="form-text">
                      Select up to 5 images of your pet to upload.
                    </small>
                    
                    {imagePreviews.length > 0 && (
                      <div className="image-preview-container" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap' }}>
                        {imagePreviews.map((preview, index) => (
                          <div key={index} style={{ position: 'relative', marginRight: '10px', marginBottom: '10px' }}>
                            <img
                              src={preview}
                              alt={`Preview ${index}`}
                              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: 'rgba(255, 0, 0, 0.7)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '25px',
                                height: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Pet for Sale'}
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

export default SubmitPetSellPost; 