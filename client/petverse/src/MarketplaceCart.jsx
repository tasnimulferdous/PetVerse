import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { getApiUrl } from './apiConfig';

const MarketplaceCart = () => {
  const [cart, setCart] = useState({ cartItems: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Calculate cart totals
  const itemsPrice = cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxPrice = itemsPrice * 0.15;
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // Fetch cart on component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!user) {
          navigate('/login');
          return;
        }

        const response = await fetch(getApiUrl('api/marketplace/cart'), {
          headers: {
            'Authorization': `Bearer ${user._id}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }

        const data = await response.json();
        setCart(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  // Update cart item quantity
  const updateCartQuantity = async (productId, qty) => {
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
          'Authorization': `Bearer ${user._id}`,
        },
        body: JSON.stringify({
          productId,
          qty,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('Failed to update cart. Please try again.');
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!user) {
        navigate('/login');
        return;
      }

      const response = await fetch(getApiUrl(`api/marketplace/cart/${productId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user._id}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }

      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Failed to remove from cart. Please try again.');
    }
  };

  // Add to wishlist and remove from cart
  const moveToWishlist = async (productId) => {
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!user) {
        navigate('/login');
        return;
      }

      // Add to wishlist
      const wishlistResponse = await fetch(getApiUrl('api/marketplace/wishlist'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user._id}`,
        },
        body: JSON.stringify({
          productId,
        }),
      });

      if (!wishlistResponse.ok) {
        throw new Error('Failed to add to wishlist');
      }

      // Remove from cart
      await removeFromCart(productId);
      alert('Item moved to wishlist!');
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      alert('Failed to move to wishlist. Please try again.');
    }
  };

  // Checkout handler
  const checkoutHandler = () => {
    navigate('/marketplace/checkout');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Your Cart</h1>
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
              <a href="/adoption">
                <i className="fas fa-paw" style={{ marginRight: '8px' }}></i>
                <span>Adoption</span>
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
          <h2 className="cart-title">Shopping Cart</h2>
          
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="cart-container">
              {cart.cartItems.length === 0 ? (
                <div className="empty-cart">
                  <i className="fas fa-shopping-cart fa-3x"></i>
                  <p>Your cart is empty</p>
                  <button onClick={() => navigate('/marketplace')} className="continue-shopping">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="cart-content">
                  <div className="cart-items">
                    {cart.cartItems.map((item) => (
                      <div key={item.product} className="cart-item">
                        <div className="cart-item-image">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="cart-item-details">
                          <h3>{item.name}</h3>
                          <p className="cart-item-price">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="cart-item-actions">
                          <div className="quantity-selector">
                            <button 
                              onClick={() => updateCartQuantity(item.product, Math.max(1, item.qty - 1))}
                              disabled={item.qty <= 1}
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <span>{item.qty}</span>
                            <button 
                              onClick={() => updateCartQuantity(item.product, item.qty + 1)}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                          <div className="cart-item-buttons">
                            <button 
                              onClick={() => moveToWishlist(item.product)}
                              className="wishlist-button"
                            >
                              <i className="far fa-heart"></i>
                            </button>
                            <button 
                              onClick={() => removeFromCart(item.product)}
                              className="remove-button"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cart-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-item">
                      <span>Items:</span>
                      <span>${itemsPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                      <span>Tax:</span>
                      <span>${taxPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                      <span>Shipping:</span>
                      <span>${shippingPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-item total">
                      <span>Total:</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={checkoutHandler}
                      className="checkout-button"
                      disabled={cart.cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </button>
                    <button 
                      onClick={() => navigate('/marketplace')}
                      className="continue-shopping"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MarketplaceCart; 