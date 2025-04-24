import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import Dashboard from './Dashboard';
import AdminDashboard from './admin/pages/AdminDashboard';
import Profile from './Profile';
import Adoption from './Adoption';
import Notification from './Notification';
import Search from './Search';
import Marketplace from './Marketplace';
import MarketplaceCart from './MarketplaceCart';
import MarketplaceCheckout from './MarketplaceCheckout';
import MarketplaceOrder from './MarketplaceOrder';
import SubmitProduct from './SubmitProduct';
import MySubmissions from './MySubmissions';
import AdminProductReview from './AdminProductReview';
import './App.css';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Router>
      <div className="main-nav-container">
        <button className="mobile-menu-button" onClick={toggleMenu}>
          <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        <nav className={`nav-bar ${menuOpen ? 'nav-open' : ''}`}>
          <Link to="/signup" className="nav-link" onClick={() => setMenuOpen(false)}>Signup</Link>
          <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/adoption" className="nav-link" onClick={() => setMenuOpen(false)}>Adoption</Link>
          <Link to="/marketplace" className="nav-link" onClick={() => setMenuOpen(false)}>Marketplace</Link>
          <Link to="/notifications" className="nav-link" onClick={() => setMenuOpen(false)}>Notification</Link>
          <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>Profile</Link>
          <Link to="/search" className="nav-link" onClick={() => setMenuOpen(false)}>Search</Link>
          <Link to="/submit-product" className="nav-link" onClick={() => setMenuOpen(false)}>Submit Product</Link>
        </nav>
      </div>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/adoption" element={<Adoption />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/cart" element={<MarketplaceCart />} />
        <Route path="/marketplace/checkout" element={<MarketplaceCheckout />} />
        <Route path="/marketplace/order/:id" element={<MarketplaceOrder />} />
        <Route path="/submit-product" element={<SubmitProduct />} />
        <Route path="/my-submissions" element={<MySubmissions />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/product-review" element={<AdminProductReview />} />
        <Route path="*" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
