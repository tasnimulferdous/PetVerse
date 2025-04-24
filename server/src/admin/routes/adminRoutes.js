const express = require('express');
const adminController = require('../controller/adminController');

const router = express.Router();

// User routes
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

// Post routes
router.get('/posts', adminController.getAllPosts);
router.delete('/posts/:id', adminController.deletePost);

// Adoption post routes
router.get('/adoption-posts', adminController.getAllAdoptionPosts);
router.delete('/adoption-posts/:id', adminController.deleteAdoptionPost);

module.exports = router;
