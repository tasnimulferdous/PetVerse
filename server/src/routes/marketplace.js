const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const ProductSubmission = require('../models/ProductSubmission');
const PetSellPost = require('../models/PetSellPost');
const router = express.Router();

// Setup multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Session-based Authentication middleware
const sessionAuth = async (req, res, next) => {
  try {
    if (!req.session.userId || !req.session.isAuthenticated) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// PRODUCT ROUTES

// Get all products with filtering
router.get('/products', async (req, res) => {
  try {
    const { category, keyword, minPrice, maxPrice } = req.query;
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get single product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// Create a new product (admin only)
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, brand, category, description, price, countInStock } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    
    const product = new Product({
      name,
      brand,
      category,
      description,
      price: Number(price),
      countInStock: Number(countInStock),
      image: imageUrl,
      user: req.body.userId || "admin", // Use provided userId or default to admin
      rating: 0,
      numReviews: 0
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// Update a product (admin only)
router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, brand, category, description, price, countInStock } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.name = name || product.name;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.description = description || product.description;
    product.price = Number(price) || product.price;
    product.countInStock = Number(countInStock) || product.countInStock;
    
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }
    
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete a product (admin only)
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// Add review to product
router.post('/products/:id/reviews', async (req, res) => {
  try {
    const { rating, comment, userId, userName } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user already submitted a review if userId is provided
    if (userId) {
      const alreadyReviewed = product.reviews.find(
        r => r.user.toString() === userId.toString()
      );
      
      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }
    }
    
    const review = {
      name: userName || 'Anonymous',
      rating: Number(rating),
      comment,
      user: userId || 'anonymous'
    };
    
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add review' });
  }
});

// CART ROUTES

// Get current user's cart
router.get('/cart/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) {
      return res.json({ cartItems: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/cart', async (req, res) => {
  try {
    const { productId, qty, userId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      // Create new cart if none exists
      cart = new Cart({
        user: userId,
        cartItems: [{
          name: product.name,
          qty: Number(qty),
          image: product.image,
          price: product.price,
          product: product._id
        }]
      });
    } else {
      // Update existing cart
      const existItem = cart.cartItems.find(x => x.product.toString() === productId);
      
      if (existItem) {
        existItem.qty = Number(qty);
      } else {
        cart.cartItems.push({
          name: product.name,
          qty: Number(qty),
          image: product.image,
          price: product.price,
          product: product._id
        });
      }
    }
    
    const updatedCart = await cart.save();
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/cart/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.cartItems = cart.cartItems.filter(item => item.product.toString() !== productId);
    
    const updatedCart = await cart.save();
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/cart/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId });
    if (cart) {
      await cart.remove();
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

// ORDER ROUTES

// Create new order
router.post('/orders', async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      userId
    } = req.body;
    
    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    
    const order = new Order({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice
    });
    
    const createdOrder = await order.save();
    
    // Clear the cart after creating an order
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      await cart.remove();
    }
    
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Get user orders
router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/orders/detail/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Update order to paid
router.put('/orders/:id/pay', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer?.email_address
    };
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order' });
  }
});

// Update order to delivered
router.put('/orders/:id/deliver', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order' });
  }
});

// Get all orders
router.get('/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// WISHLIST ROUTES

// Get user wishlist
router.get('/wishlist/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
});

// Add product to wishlist
router.post('/wishlist', async (req, res) => {
  try {
    const { productId, userId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const user = await User.findById(userId);
    
    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    user.wishlist.push(productId);
    await user.save();
    
    res.json({ message: 'Product added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update wishlist' });
  }
});

// Remove product from wishlist
router.delete('/wishlist/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    const user = await User.findById(userId);
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    
    await user.save();
    res.json({ message: 'Product removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update wishlist' });
  }
});

// PRODUCT SUBMISSION ROUTES

// Submit a product for approval
router.post('/product-submissions', sessionAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, brand, category, description, price } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image; // Allow image URL or file upload
    
    const submission = new ProductSubmission({
      name,
      brand,
      category,
      description,
      price: Number(price),
      image: imageUrl,
      user: req.user._id, // Use the authenticated user from session
      status: 'pending'
    });
    
    const createdSubmission = await submission.save();
    res.status(201).json(createdSubmission);
  } catch (error) {
    console.error('Error submitting product:', error);
    res.status(500).json({ message: 'Failed to submit product' });
  }
});

// Get all product submissions
router.get('/product-submissions', async (req, res) => {
  try {
    const submissions = await ProductSubmission.find()
      .sort({ submittedAt: -1 })
      .populate('user', 'name email');
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product submissions' });
  }
});

// Get user's own product submissions
router.get('/my-product-submissions', sessionAuth, async (req, res) => {
  try {
    const submissions = await ProductSubmission.find({ user: req.user._id })
      .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your product submissions' });
  }
});

// Approve or reject a product submission (admin only)
router.patch('/product-submissions/:id/review', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const submission = await ProductSubmission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    submission.status = status;
    submission.reviewedAt = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      submission.rejectionReason = rejectionReason;
    }
    
    // If approved, create an actual product
    if (status === 'approved') {
      const product = new Product({
        name: submission.name,
        brand: submission.brand,
        category: submission.category,
        description: submission.description,
        price: submission.price,
        image: submission.image,
        user: submission.user, // Keep original user as the owner
        rating: 0,
        numReviews: 0,
        countInStock: 10 // Default stock value
      });
      
      await product.save();
    }
    
    await submission.save();
    res.json(submission);
  } catch (error) {
    console.error('Error reviewing product submission:', error);
    res.status(500).json({ message: 'Failed to review product submission' });
  }
});

// PET SELL POST ROUTES

// Submit a pet for selling (requires authentication)
router.post('/pet-sell-posts', sessionAuth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, breed, age, ageUnit, gender, description, price, location, healthStatus, vaccination } = req.body;
    
    // Process uploaded images
    const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    // If no files uploaded but image URLs provided in request body
    if (imageUrls.length === 0 && req.body.images) {
      const bodyImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      imageUrls.push(...bodyImages);
    }
    
    if (imageUrls.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }
    
    const petPost = new PetSellPost({
      name,
      breed,
      age: Number(age),
      ageUnit,
      gender,
      description,
      price: Number(price),
      images: imageUrls,
      location,
      healthStatus,
      vaccination,
      user: req.user._id,
      status: 'pending'
    });
    
    const createdPost = await petPost.save();
    res.status(201).json(createdPost);
  } catch (error) {
    console.error('Error submitting pet sell post:', error);
    res.status(500).json({ message: 'Failed to submit pet for selling' });
  }
});

// Get all approved pet sell posts
router.get('/pet-sell-posts', async (req, res) => {
  try {
    const filter = { status: 'approved' };
    
    // Optional filtering
    const { breed, minAge, maxAge, minPrice, maxPrice, gender } = req.query;
    
    if (breed) {
      filter.breed = { $regex: breed, $options: 'i' };
    }
    
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = Number(minAge);
      if (maxAge) filter.age.$lte = Number(maxAge);
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (gender && ['male', 'female'].includes(gender)) {
      filter.gender = gender;
    }
    
    const petPosts = await PetSellPost.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    res.json(petPosts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pet sell posts' });
  }
});

// Get single pet sell post by ID
router.get('/pet-sell-posts/:id', async (req, res) => {
  try {
    const petPost = await PetSellPost.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!petPost) {
      return res.status(404).json({ message: 'Pet sell post not found' });
    }
    
    res.json(petPost);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pet sell post' });
  }
});

// Get user's own pet sell posts
router.get('/my-pet-sell-posts', sessionAuth, async (req, res) => {
  try {
    const petPosts = await PetSellPost.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(petPosts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your pet sell posts' });
  }
});

// Get all pet sell posts (admin only - includes pending posts)
router.get('/admin/pet-sell-posts', async (req, res) => {
  try {
    const petPosts = await PetSellPost.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    res.json(petPosts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pet sell posts' });
  }
});

// Update pet sell post (owner only)
router.put('/pet-sell-posts/:id', sessionAuth, upload.array('images', 5), async (req, res) => {
  try {
    const petPost = await PetSellPost.findById(req.params.id);
    
    if (!petPost) {
      return res.status(404).json({ message: 'Pet sell post not found' });
    }
    
    // Verify ownership
    if (petPost.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    // Only allow updates if status is pending or rejected
    if (petPost.status === 'approved') {
      return res.status(400).json({ message: 'Cannot update an approved post' });
    }
    
    const { name, breed, age, ageUnit, gender, description, price, location, healthStatus, vaccination } = req.body;
    
    // Process newly uploaded images
    const newImageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    // Handle existing images
    let existingImages = [];
    if (req.body.existingImages) {
      existingImages = Array.isArray(req.body.existingImages) 
        ? req.body.existingImages 
        : [req.body.existingImages];
    }
    
    // Combine existing and new images
    const allImages = [...existingImages, ...newImageUrls];
    
    // Update pet post fields
    petPost.name = name || petPost.name;
    petPost.breed = breed || petPost.breed;
    petPost.age = age ? Number(age) : petPost.age;
    petPost.ageUnit = ageUnit || petPost.ageUnit;
    petPost.gender = gender || petPost.gender;
    petPost.description = description || petPost.description;
    petPost.price = price ? Number(price) : petPost.price;
    petPost.location = location || petPost.location;
    petPost.healthStatus = healthStatus || petPost.healthStatus;
    petPost.vaccination = vaccination || petPost.vaccination;
    
    // Only update images if new ones provided
    if (allImages.length > 0) {
      petPost.images = allImages;
    }
    
    // Reset status to pending if it was rejected
    if (petPost.status === 'rejected') {
      petPost.status = 'pending';
      petPost.rejectionReason = null;
    }
    
    const updatedPetPost = await petPost.save();
    res.json(updatedPetPost);
  } catch (error) {
    console.error('Error updating pet sell post:', error);
    res.status(500).json({ message: 'Failed to update pet sell post' });
  }
});

// Approve or reject a pet sell post (admin only)
router.patch('/pet-sell-posts/:id/review', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const petPost = await PetSellPost.findById(req.params.id);
    
    if (!petPost) {
      return res.status(404).json({ message: 'Pet sell post not found' });
    }
    
    petPost.status = status;
    petPost.reviewedAt = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      petPost.rejectionReason = rejectionReason;
    }
    
    await petPost.save();
    res.json(petPost);
  } catch (error) {
    console.error('Error reviewing pet sell post:', error);
    res.status(500).json({ message: 'Failed to review pet sell post' });
  }
});

// Delete pet sell post (owner or admin only)
router.delete('/pet-sell-posts/:id', async (req, res) => {
  try {
    const petPost = await PetSellPost.findById(req.params.id);
    
    if (!petPost) {
      return res.status(404).json({ message: 'Pet sell post not found' });
    }
    
    // Check if user is owner or admin
    if (petPost.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await petPost.remove();
    res.json({ message: 'Pet sell post removed' });
  } catch (error) {
    console.error('Error deleting pet sell post:', error);
    res.status(500).json({ message: 'Failed to delete pet sell post' });
  }
});

module.exports = router; 