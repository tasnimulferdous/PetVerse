const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./src/routes/auth');
const postsRoutes = require('./src/routes/posts');
const adoptionRoutes = require('./src/routes/adoption');
const userRequestsRoutes = require('./src/routes/userRequests');
const adminRoutes = require('./src/admin/routes/adminRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use('/api', authRoutes);
app.use('/api', postsRoutes);
app.use('/api', adoptionRoutes);
app.use('/api', userRequestsRoutes);
app.use('/api/admin', adminRoutes);

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
