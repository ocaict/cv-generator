const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { forwardAuthenticated } = require('../middleware/auth');

router.get('/register', forwardAuthenticated, authController.getRegister);
router.post('/register', forwardAuthenticated, authController.postRegister);

router.get('/login', forwardAuthenticated, authController.getLogin);
router.post('/login', forwardAuthenticated, authController.postLogin);

router.get('/logout', authController.logout);

module.exports = router;
