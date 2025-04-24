const express = require('express');
const adminController = require('../controller/adminController');

const router = express.Router();

router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

router.get('/posts', adminController.getAllPosts);
router.delete('/posts/:id', adminController.deletePost);

module.exports = router;
