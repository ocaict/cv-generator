const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const aiController = require('../controllers/aiController');
const { ensureAuthenticated } = require('../middleware/auth');

// Rate limit: disabled temporarily for debugging
// const aiLimiter = rateLimit({ ... });

/**
 * AI Generation Endpoint
 * POST /api/ai/generate
 * Body: { type, input, context }
 */
router.post('/generate', ensureAuthenticated, aiController.generateAI);

module.exports = router;
