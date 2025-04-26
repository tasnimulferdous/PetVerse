import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
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
import SubmitPetSellPost from './SubmitPetSellPost';
import MyPetSellPosts from './MyPetSellPosts';
import PetMarketplace from './PetMarketplace';
import AdminPetSellReview from './admin/AdminPetSellReview';
import AdminPetSellPosts from './AdminPetSellPosts';
import AdoptMessage from './AdoptMessage';
import './App.css';

// Separate Navigation component
function Navigation() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    // Don't render navigation on specific pages
    if (location.pathname === '/adoption' || 
        location.pathname === '/adopt-message' || 
        location.pathname === '/notifications') {
        return null;
    }

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div className="main-nav-container">
            <button className="mobile-menu-button" onClick={toggleMenu}>
                <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
            <nav className={`nav-bar ${menuOpen ? 'nav-open' : ''}`}>
                {/* <Link to="/signup" className="nav-link" onClick={() => setMenuOpen(false)}>Signup</Link> */}
                {/* <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link> */}
                <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link to="/adoption" className="nav-link" onClick={() => setMenuOpen(false)}>Adoption</Link>
                <Link to="/marketplace" className="nav-link" onClick={() => setMenuOpen(false)}>Marketplace</Link>
                <Link to="/pet-marketplace" className="nav-link" onClick={() => setMenuOpen(false)}>Pet Marketplace</Link>
                <Link to="/adopt-message" className="nav-link" onClick={() => setMenuOpen(false)}>AdoptMessages</Link>
                <Link to="/notifications" className="nav-link" onClick={() => setMenuOpen(false)}>Notification</Link>
                <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>Profile</Link>
                <Link to="/search" className="nav-link" onClick={() => setMenuOpen(false)}>Search</Link>
                <Link to="/submit-product" className="nav-link" onClick={() => setMenuOpen(false)}>Submit Product</Link>
                <Link to="/submit-pet-sell-post" className="nav-link" onClick={() => setMenuOpen(false)}>Sell a Pet</Link>
            </nav>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Navigation />
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
                <Route path="/pet-marketplace" element={<PetMarketplace />} />
                <Route path="/submit-pet-sell-post" element={<SubmitPetSellPost />} />
                <Route path="/my-pet-sell-posts" element={<MyPetSellPosts />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/product-review" element={<AdminProductReview />} />
                <Route path="/admin/pet-sell-review" element={<AdminPetSellReview />} />
                <Route path="/admin/pet-sell-posts" element={<AdminPetSellPosts />} />
                <Route path="/adopt-message" element={<AdoptMessage />} />
                <Route path="*" element={<Signup />} />
            </Routes>
        </Router>
    );
}

export default App;
