import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { getApiUrl } from './apiConfig';

const MarketplaceCheckout = () => {
  const [cart, setCart] = useState({ cartItems: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const navigate = useNavigate();

  // Calculate order totals
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
        
        // If cart is empty, redirect to cart page
        if (!data.cartItems || data.cartItems.length === 0) {
          navigate('/marketplace/cart');
          return;
        }
        
        setCart(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  // Check for saved shipping address in local storage
  useEffect(() => {
    const savedShippingAddress = localStorage.getItem('shippingAddress');
    if (savedShippingAddress) {
      setShippingAddress(JSON.parse(savedShippingAddress));
    }
  }, []);

  // Handle shipping form input changes
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle payment method change
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Handle form submission to create order
  const placeOrderHandler = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!user) {
        navigate('/login');
        return;
      }

      // Save shipping address to local storage
      localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));

      // Create order
      const response = await fetch(getApiUrl('api/marketplace/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user._id}`,
        },
        body: JSON.stringify({
          orderItems: cart.cartItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      navigate(`/marketplace/order/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Checkout</h1>
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
              <a href="/marketplace/cart">
                <i className="fas fa-shopping-basket" style={{ marginRight: '8px' }}></i>
                <span>Cart</span>
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
          <h2 className="checkout-title">Complete Your Order</h2>
          
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="checkout-container">
              <div className="checkout-form-container">
                <form onSubmit={placeOrderHandler} className="checkout-form">
                  <div className="checkout-section">
                    <h3>Shipping Information</h3>
                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        placeholder="Enter your address"
                        value={shippingAddress.address}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        placeholder="Enter your city"
                        value={shippingAddress.city}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="postalCode">Postal Code</label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        placeholder="Enter your postal code"
                        value={shippingAddress.postalCode}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        placeholder="Enter your country"
                        value={shippingAddress.country}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="checkout-section">
                    <h3>Payment Method</h3>
                    <div className="payment-methods">
                      <div className="payment-method">
                        <input
                          type="radio"
                          id="paypal"
                          name="paymentMethod"
                          value="PayPal"
                          checked={paymentMethod === 'PayPal'}
                          onChange={handlePaymentMethodChange}
                        />
                        <label htmlFor="paypal">PayPal or Credit Card</label>
                      </div>
                      <div className="payment-method">
                        <input
                          type="radio"
                          id="stripe"
                          name="paymentMethod"
                          value="Stripe"
                          checked={paymentMethod === 'Stripe'}
                          onChange={handlePaymentMethodChange}
                        />
                        <label htmlFor="stripe">Stripe</label>
                      </div>
                      <div className="payment-method">
                        <input
                          type="radio"
                          id="cash"
                          name="paymentMethod"
                          value="Cash on Delivery"
                          checked={paymentMethod === 'Cash on Delivery'}
                          onChange={handlePaymentMethodChange}
                        />
                        <label htmlFor="cash">Cash on Delivery</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="checkout-section">
                    <h3>Order Summary</h3>
                    <div className="order-summary">
                      <div className="order-items">
                        {cart.cartItems.map((item) => (
                          <div key={item.product} className="order-item">
                            <div className="order-item-image">
                              <img src={item.image} alt={item.name} />
                            </div>
                            <div className="order-item-details">
                              <h4>{item.name}</h4>
                              <p>
                                {item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-totals">
                        <div className="order-total-item">
                          <span>Items:</span>
                          <span>${itemsPrice.toFixed(2)}</span>
                        </div>
                        <div className="order-total-item">
                          <span>Shipping:</span>
                          <span>${shippingPrice.toFixed(2)}</span>
                        </div>
                        <div className="order-total-item">
                          <span>Tax:</span>
                          <span>${taxPrice.toFixed(2)}</span>
                        </div>
                        <div className="order-total-item total">
                          <span>Total:</span>
                          <span>${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button type="submit" className="place-order-button">
                    Place Order
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MarketplaceCheckout; 