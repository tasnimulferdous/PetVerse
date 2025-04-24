import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PET_SELL_POSTS_URL, PET_SELL_POST_DETAIL_URL, getImageUrl } from './apiConfig';
import { toast } from 'react-toastify';
import './App.css';

function PetMarketplace() {
  const [petPosts, setPetPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    minPrice: '',
    maxPrice: '',
    gender: '',
    sortOption: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPetPosts = async () => {
      try {
        setLoading(true);
        
        // Build query string from filters
        const params = new URLSearchParams();
        if (filters.searchTerm) {
          params.append('searchTerm', filters.searchTerm);
        }
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.gender) params.append('gender', filters.gender);
        
        const url = `${PET_SELL_POSTS_URL}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await axios.get(url);
        
        // Client-side filtering for searchTerm if the API doesn't support it directly
        let filteredData = response.data;
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          filteredData = filteredData.filter(pet => 
            pet.breed?.toLowerCase().includes(searchLower) || 
            pet.species?.toLowerCase().includes(searchLower)
          );
        }
        
        setPetPosts(filteredData);
        setError(null);
      } catch (err) {
        console.error('Error fetching pet posts:', err);
        setError('Failed to fetch pet listings. Please try again later.');
        toast.error('Failed to fetch pet listings');
      } finally {
        setLoading(false);
      }
    };

    fetchPetPosts();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      minPrice: '',
      maxPrice: '',
      gender: '',
      sortOption: ''
    });
  };

  const openPetDetails = async (id) => {
    try {
      const response = await axios.get(PET_SELL_POST_DETAIL_URL(id));
      setSelectedPet(response.data);
    } catch (error) {
      console.error('Error fetching pet details:', error);
      toast.error('Failed to fetch pet details');
    }
  };

  const closePetDetails = () => {
    setSelectedPet(null);
  };
  
  const addToWishlist = async (petId) => {
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!user) {
        navigate('/login');
        return;
      }

      // Assuming there's an API endpoint for adding pets to wishlist
      // You would need to implement this endpoint on the server
      toast.success('Pet added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  // Filter and sort pet posts
  const getFilteredAndSortedPets = () => {
    let filteredPets = [...petPosts];

    // Apply sorting
    if (filters.sortOption === 'price-asc') {
      filteredPets.sort((a, b) => a.price - b.price);
    } else if (filters.sortOption === 'price-desc') {
      filteredPets.sort((a, b) => b.price - a.price);
    } else if (filters.sortOption === 'newest') {
      filteredPets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sortOption === 'oldest') {
      filteredPets.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return filteredPets;
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Pet Marketplace</h1>
        <div className="marketplace-header-actions">
          <button 
            onClick={() => navigate('/submit-pet-sell-post')} 
            className="submit-product-button"
          >
            <i className="fas fa-plus"></i> List Your Pet
          </button>
        </div>
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
              <button onClick={handleLogout} className="logout-button">
                <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>

        <main className="dashboard-main">
          <div className="marketplace-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by breed or species..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange({target: {name: 'searchTerm', value: e.target.value}})}
              />
            </div>
            
            <div className="filter-section">
              <label>Gender:</label>
              <select name="gender" value={filters.gender} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            
            <div className="filter-section">
              <label>Price Range:</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="filter-section">
              <label>Sort By:</label>
              <select name="sortOption" value={filters.sortOption} onChange={handleFilterChange}>
                <option value="">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            
            <button className="btn btn-outline-secondary" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : getFilteredAndSortedPets().length === 0 ? (
            <div className="no-products">No pet listings found matching your criteria.</div>
          ) : (
            <div className="products-grid">
              {getFilteredAndSortedPets().map((pet) => (
                <div key={pet._id} className="product-card">
                  <div className="product-image">
                    <img src={getImageUrl(pet.images[0])} alt={pet.name} />
                  </div>
                  <div className="product-info">
                    <h3>{pet.name}</h3>
                    <p className="product-brand">
                      {pet.species && <span className="badge bg-info me-2">{pet.species}</span>}
                      {pet.breed} • {pet.age} {pet.ageUnit} • {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
                    </p>
                    <p className="product-price">${pet.price.toFixed(2)}</p>
                    <p className="product-brand"><i className="fas fa-map-marker-alt"></i> {pet.location}</p>
                    <div className="product-actions">
                      <button
                        onClick={() => openPetDetails(pet._id)}
                        className="view-details-button"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => addToWishlist(pet._id)}
                        className="wishlist-button"
                      >
                        <i className="far fa-heart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Pet Details Modal */}
      {selectedPet && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{selectedPet.name}</h3>
              <button className="close-modal-button" onClick={closePetDetails}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div id="petDetailsCarousel" className="carousel slide">
                    <div className="carousel-inner">
                      {selectedPet.images.map((image, index) => (
                        <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                          <img 
                            src={getImageUrl(image)} 
                            className="d-block w-100" 
                            alt={`${selectedPet.name} ${index + 1}`}
                            style={{ height: '300px', objectFit: 'cover' }} 
                          />
                        </div>
                      ))}
                    </div>
                    {selectedPet.images.length > 1 && (
                      <>
                        <button className="carousel-control-prev" type="button" data-bs-target="#petDetailsCarousel" data-bs-slide="prev">
                          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                          <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#petDetailsCarousel" data-bs-slide="next">
                          <span className="carousel-control-next-icon" aria-hidden="true"></span>
                          <span className="visually-hidden">Next</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <h3>{selectedPet.name}</h3>
                  <div className="mb-3">
                    {selectedPet.species && <span className="badge bg-info me-2">{selectedPet.species}</span>}
                    <span className="badge bg-primary me-2">{selectedPet.breed}</span>
                    <span className="badge bg-secondary me-2">
                      {selectedPet.age} {selectedPet.ageUnit}
                    </span>
                    <span className="badge bg-dark">
                      {selectedPet.gender.charAt(0).toUpperCase() + selectedPet.gender.slice(1)}
                    </span>
                  </div>
                  <h4 className="text-primary mb-3">${selectedPet.price.toFixed(2)}</h4>
                  <p><strong>Location:</strong> {selectedPet.location}</p>
                  <p><strong>Health Status:</strong> {selectedPet.healthStatus}</p>
                  <p><strong>Vaccination:</strong> {selectedPet.vaccination || 'Not specified'}</p>

                  <div className="action-buttons">
                    <button className="btn btn-success">
                      <i className="fas fa-phone"></i> Contact Seller
                    </button>
                    <button className="btn btn-outline-primary" onClick={() => addToWishlist(selectedPet._id)}>
                      <i className="far fa-heart"></i> Add to Wishlist
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h5>Description</h5>
                <p>{selectedPet.description}</p>
              </div>
              
              <div className="mt-3">
                <h5>Seller Information</h5>
                <p><strong>Name:</strong> {selectedPet.user?.name || 'Anonymous'}</p>
                <p><strong>Listed on:</strong> {new Date(selectedPet.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="cancel-button" onClick={closePetDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PetMarketplace; 