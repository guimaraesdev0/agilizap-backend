// routes/user.routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authenticateToken = require('../middleware/Auth');

router.get('/users', authenticateToken, UserController.getAllUsers);
router.get('/user/:id', authenticateToken, UserController.getUserById);
router.post('/signin', UserController.createUser);
router.post('/login', UserController.login);

    
router.get('/cupons', UserController.getCupons);

module.exports = router;
