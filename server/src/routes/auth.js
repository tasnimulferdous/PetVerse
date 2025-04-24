const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, phone, email, password, favouritePet } = req.body;

    if (!name || !phone || !email || !password || !favouritePet) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      favouritePet,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create session data
    req.session.userId = user._id;
    req.session.isAuthenticated = true;

    // Create a user object without sensitive data
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      favouritePet: user.favouritePet,
      isAdmin: user.isAdmin || false
    };

    res.status(200).json({ message: 'Login successful', user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout successful' });
  });
});

// Get current authenticated user from session
router.get('/me', (req, res) => {
  if (!req.session.userId || !req.session.isAuthenticated) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  User.findById(req.session.userId, '-password')
    .then(user => {
      if (!user) {
        req.session.destroy();
        return res.status(401).json({ message: 'User not found' });
      }
      res.json({ user });
    })
    .catch(error => {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await User.findOne({ email }, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile (except email and phone)
router.put('/profile', async (req, res) => {
  try {
    const { email, name, favouritePet } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (name) user.name = name;
    if (favouritePet) user.favouritePet = favouritePet;
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
