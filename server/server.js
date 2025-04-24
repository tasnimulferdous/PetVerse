const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/auth');
const postsRoutes = require('./src/routes/posts');
const adoptionRoutes = require('./src/routes/adoption');
const userRequestsRoutes = require('./src/routes/userRequests');
const adminRoutes = require('./src/admin/routes/adminRoutes');
const marketplaceRoutes = require('./src/routes/marketplace');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: 'your-secret-key', // Change this to a real secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Helps with CSRF
  }
}));

app.use('/uploads', express.static('uploads'));

app.use('/api', authRoutes);
app.use('/api', postsRoutes);
app.use('/api', adoptionRoutes);
app.use('/api', userRequestsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/marketplace', marketplaceRoutes);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
