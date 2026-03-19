const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { ensureAuthenticated } = require('../middleware/auth');

/**
 * AI Generation Endpoint
 * POST /api/ai/generate
 * Body: { type, input, context }
 */
router.post('/generate', ensureAuthenticated, aiController.generateAI);

module.exports = router;
