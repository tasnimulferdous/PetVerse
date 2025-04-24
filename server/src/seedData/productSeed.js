const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Configure dotenv with the correct path to .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedProducts = async () => {
  console.log('Seeding products...');
  
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    console.log('Connecting to MongoDB with URI:', mongoUri); // Log the URI for debugging
    
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined');
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clean up existing products
    await Product.deleteMany({});
    
    // Find an admin user or create one for product ownership
    let adminUser = await User.findOne({ email: 'admin@petverse.com' });
    
    if (!adminUser) {
      adminUser = await User.findOne({});
      if (!adminUser) {
        console.error('No users found in the database. Please create at least one user before seeding products.');
        process.exit(1);
      }
    }

    // Sample products data
    const productsData = [
      {
        name: 'Premium Dog Food',
        image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=800&auto=format&fit=crop',
        brand: 'PetNutri',
        category: 'Pet Food',
        description: 'High-quality dog food with balanced nutrition for adult dogs. Contains real chicken, vegetables, and essential vitamins.',
        price: 29.99,
        countInStock: 50,
        rating: 4.5,
        numReviews: 12,
        user: adminUser._id,
      },
      {
        name: 'Interactive Cat Toy',
        image: 'https://images.unsplash.com/photo-1526336179256-1347bdb255ee?w=800&auto=format&fit=crop',
        brand: 'FunPets',
        category: 'Pet Toys',
        description: 'Interactive toy for cats that stimulates hunting instincts and provides hours of entertainment.',
        price: 14.99,
        countInStock: 35,
        rating: 4.0,
        numReviews: 8,
        user: adminUser._id,
      },
      {
        name: 'Adjustable Dog Collar',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop',
        brand: 'PetStyle',
        category: 'Pet Accessories',
        description: 'Durable and adjustable collar for dogs of all sizes. Comfortable and stylish design with secure buckle.',
        price: 12.99,
        countInStock: 45,
        rating: 4.8,
        numReviews: 15,
        user: adminUser._id,
      },
      {
        name: 'Pet Multivitamin Supplement',
        image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=800&auto=format&fit=crop',
        brand: 'PetHealth',
        category: 'Pet Health',
        description: 'Complete daily multivitamin supplement for pets to support overall health and well-being.',
        price: 19.99,
        countInStock: 28,
        rating: 4.2,
        numReviews: 10,
        user: adminUser._id,
      },
      {
        name: 'Pet Grooming Brush',
        image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=800&auto=format&fit=crop',
        brand: 'GroomPro',
        category: 'Pet Grooming',
        description: 'Professional grooming brush for cats and dogs. Removes loose fur and detangles while being gentle on the skin.',
        price: 16.99,
        countInStock: 40,
        rating: 4.3,
        numReviews: 11,
        user: adminUser._id,
      },
      {
        name: 'Premium Cat Food',
        image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop',
        brand: 'PetNutri',
        category: 'Pet Food',
        description: 'High-quality cat food with balanced nutrition for adult cats. Contains real fish, vegetables, and essential vitamins.',
        price: 24.99,
        countInStock: 48,
        rating: 4.6,
        numReviews: 14,
        user: adminUser._id,
      },
      {
        name: 'Dog Training Treats',
        image: 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?w=800&auto=format&fit=crop',
        brand: 'TrainRight',
        category: 'Pet Food',
        description: 'Small, low-calorie treats perfect for dog training. Made with natural ingredients and irresistible to dogs.',
        price: 9.99,
        countInStock: 60,
        rating: 4.4,
        numReviews: 16,
        user: adminUser._id,
      },
      {
        name: 'Pet Carrier Bag',
        image: 'https://images.unsplash.com/photo-1581325696817-b23e5f3e226c?w=800&auto=format&fit=crop',
        brand: 'PetTravel',
        category: 'Pet Accessories',
        description: 'Comfortable and secure carrier bag for small pets. Features mesh ventilation and padded interior.',
        price: 34.99,
        countInStock: 25,
        rating: 4.1,
        numReviews: 9,
        user: adminUser._id,
      },
      {
        name: 'Pet Waste Bags',
        image: 'https://images.unsplash.com/photo-1581321825690-944511645947?w=800&auto=format&fit=crop',
        brand: 'CleanPets',
        category: 'Pet Accessories',
        description: 'Biodegradable waste bags for responsible pet owners. Easy to use and environmentally friendly.',
        price: 7.99,
        countInStock: 75,
        rating: 4.7,
        numReviews: 18,
        user: adminUser._id,
      },
      {
        name: 'Bird Cage Toy Set',
        image: 'https://images.unsplash.com/photo-1604860588851-6de45c0aa98d?w=800&auto=format&fit=crop',
        brand: 'BirdFun',
        category: 'Pet Toys',
        description: 'Set of 5 colorful toys for bird cages. Keeps birds entertained and stimulated.',
        price: 11.99,
        countInStock: 30,
        rating: 4.0,
        numReviews: 7,
        user: adminUser._id,
      },
    ];

    // Insert sample products into the database
    const createdProducts = await Product.insertMany(productsData);
    console.log(`${createdProducts.length} products seeded successfully!`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

// Run the seed function
seedProducts(); 