import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import Dashboard from './Dashboard';
import AdminDashboard from './admin/pages/AdminDashboard';
import Profile from './Profile';
import Adoption from './Adoption';
import Notification from './Notification';
import './App.css';

function App() {
  return (
    <Router>
      <nav className="nav-bar">
        <Link to="/signup" className="nav-link">Signup</Link>
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/adoption" className="nav-link">Adoption</Link>
        <Link to="/notifications" className="nav-link">Notification</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
      </nav>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/adoption" element={<Adoption />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
