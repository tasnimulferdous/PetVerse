import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './App.css';
import { getApiUrl } from './apiConfig';

const MarketplaceOrder = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!user) {
          navigate('/login');
          return;
        }

        const response = await fetch(getApiUrl(`api/marketplace/orders/${id}`), {
          headers: {
            'Authorization': `Bearer ${user._id}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const data = await response.json();
        setOrder(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  // Handle payment
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Mock PayPal response
      const mockPayPalResult = {
        id: `PAY-${Math.random().toString(36).substring(2, 15)}`,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        payer: {
          email_address: 'customer@example.com',
        },
      };

      const response = await fetch(getApiUrl(`api/marketplace/orders/${id}/pay`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user._id}`,
        },
        body: JSON.stringify(mockPayPalResult),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const data = await response.json();
      setOrder(data);
      setPaymentLoading(false);
      alert('Payment successful!');
    } catch (error) {
      setError(error.message);
      setPaymentLoading(false);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Order Details</h1>
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
          <h2 className="order-title">Order #{id}</h2>
          
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : order ? (
            <div className="order-container">
              <div className="order-info-grid">
                <div className="order-info-card shipping">
                  <h3>Shipping</h3>
                  <p><strong>Name:</strong> {JSON.parse(localStorage.getItem('loggedInUser')).name}</p>
                  <p><strong>Email:</strong> {JSON.parse(localStorage.getItem('loggedInUser')).email}</p>
                  <p>
                    <strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                    {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                  </p>
                  <div className={`delivery-status ${order.isDelivered ? 'delivered' : 'not-delivered'}`}>
                    {order.isDelivered ? (
                      <>Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</>
                    ) : (
                      <>Not Delivered</>
                    )}
                  </div>
                </div>
                
                <div className="order-info-card payment">
                  <h3>Payment</h3>
                  <p><strong>Method:</strong> {order.paymentMethod}</p>
                  <div className={`payment-status ${order.isPaid ? 'paid' : 'not-paid'}`}>
                    {order.isPaid ? (
                      <>Paid on {new Date(order.paidAt).toLocaleDateString()}</>
                    ) : (
                      <>Not Paid</>
                    )}
                  </div>
                </div>
                
                <div className="order-info-card order-items">
                  <h3>Order Items</h3>
                  <div className="order-items-list">
                    {order.orderItems.map((item) => (
                      <div key={item.product} className="order-item">
                        <div className="order-item-image">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="order-item-name">
                          <a href={`/marketplace/product/${item.product}`}>{item.name}</a>
                        </div>
                        <div className="order-item-qty">
                          {item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="order-info-card order-summary">
                  <h3>Order Summary</h3>
                  <div className="order-summary-item">
                    <span>Items:</span>
                    <span>${order.itemsPrice?.toFixed(2) || order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)}</span>
                  </div>
                  <div className="order-summary-item">
                    <span>Shipping:</span>
                    <span>${order.shippingPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="order-summary-item">
                    <span>Tax:</span>
                    <span>${order.taxPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="order-summary-item total">
                    <span>Total:</span>
                    <span>${order.totalPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  
                  {!order.isPaid && (
                    <div className="payment-actions">
                      <button 
                        onClick={handlePayment} 
                        className="pay-button"
                        disabled={paymentLoading}
                      >
                        {paymentLoading ? 'Processing...' : `Pay with ${order.paymentMethod}`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="error-message">Order not found</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MarketplaceOrder; 