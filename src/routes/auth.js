const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { forwardAuthenticated } = require('../middleware/auth');

router.get('/register', forwardAuthenticated, authController.getRegister);
router.post('/register', forwardAuthenticated, authController.postRegister);

router.get('/login', forwardAuthenticated, authController.getLogin);
router.post('/login', forwardAuthenticated, authController.postLogin);

router.get('/logout', authController.logout);

// Supabase Google OAuth Routes
router.get('/google/login', authController.supabaseGoogleLogin);
router.get('/supabase/callback', authController.supabaseCallback);
router.post('/supabase/verify', authController.supabaseVerify);

module.exports = router;
