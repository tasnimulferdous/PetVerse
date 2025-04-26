import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { getApiUrl } from './apiConfig';
import axios from 'axios';
import BuyRequestForm from './components/BuyRequestForm';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [buyProduct, setBuyProduct] = useState(null);
  const navigate = useNavigate();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl(`api/marketplace/products?category=${category}&keyword=${searchTerm}&minPrice=${minPrice}&maxPrice=${maxPrice}`));
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchTerm, minPrice, maxPrice]);

  // Fetch user cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!user) return;

        const response = await fetch(getApiUrl('api/marketplace/cart'), {
          headers: {
            'Authorization': `Bearer ${user._id || user.id}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }

        const data = await response.json();
        setCart(data.cartItems || []);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchCart();
  }, []);

  // Add product to cart
  const addToCart = async (product) => {
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!user) {
        navigate('/login');
        return;
      }

      const response = await fetch(getApiUrl('api/marketplace/cart'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user._id || user.id}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: product._id,
          qty: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const data = await response.json();
      setCart(data.cartItems || []);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleBuyClick = (product) => {
    setBuyProduct(product);
    setShowBuyForm(true);
  };

  const handleBuyFormClose = () => {
    setShowBuyForm(false);
    setBuyProduct(null);
  };

  const handleBuyFormSubmit = async (formData) => {
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!user) {
        navigate('/login');
        return;
      }

      const orderData = {
        userId: user._id || user.id,
        orderItems: [
          {
            name: buyProduct.name,
            qty: 1,
            image: buyProduct.image,
            price: buyProduct.price,
            product: buyProduct._id,
          },
        ],
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: 'Direct',
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: buyProduct.price,
        isPaid: false,
        isDelivered: false,
      };

      await axios.post(getApiUrl('api/marketplace/orders'), orderData, { withCredentials: true });
      alert('Buy request submitted successfully');
      setShowBuyForm(false);
      setBuyProduct(null);
    } catch (error) {
      console.error('Error submitting buy request:', error);
      alert('Failed to submit buy request');
    }
  };

  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    let filteredProducts = [...products];

    // Apply sorting
    if (sortOption === 'price-asc') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'newest') {
      filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filteredProducts;
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cart.some(item => item.product === productId);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Product Marketplace</h1>
        <div className="marketplace-header-actions">
          <button 
            onClick={() => navigate('/submit-product')} 
            className="submit-product-button"
          >
            <i className="fas fa-plus"></i> Submit Product
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
              <a href="/adopt-message">
                <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i>
                <span>AdoptMessages</span>
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
              <button onClick={() => { localStorage.removeItem('loggedInUser'); navigate('/login'); }} className="logout-button">
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-section">
              <label>Category:</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                <option value="Pet Food">Pet Food</option>
                <option value="Pet Toys">Pet Toys</option>
                <option value="Pet Accessories">Pet Accessories</option>
                <option value="Pet Health">Pet Health</option>
                <option value="Pet Grooming">Pet Grooming</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="filter-section">
              <label>Price Range:</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-section">
              <label>Sort By:</label>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="products-grid">
              {getFilteredAndSortedProducts().map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-price">TK {product.price.toFixed(2)}</p>
                    <p className="product-brand">{product.brand}</p>
                    <div className="product-actions">
                      <button
                        onClick={() => handleBuyClick(product)}
                        className="buy-button"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      {showBuyForm && buyProduct && (
        <BuyRequestForm
          product={buyProduct}
          onClose={handleBuyFormClose}
          onSubmit={handleBuyFormSubmit}
        />
      )}
    </div>
  );
};

export default Marketplace;
