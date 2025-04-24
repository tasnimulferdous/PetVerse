const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const ProductSubmission = require('../models/ProductSubmission');
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

module.exports = router; 