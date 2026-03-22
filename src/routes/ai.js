const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const aiController = require('../controllers/aiController');
const { ensureAuthenticated } = require('../middleware/auth');

// Rate limit: max 15 AI calls per user per minute
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    keyGenerator: (req) => req.session?.user?.id || req.ip,
    validate: { ip: false }, // Explicitly tell rate-limit we know what we're doing with req.ip
    handler: (req, res) => {
        res.status(429).json({ error: 'You are generating too quickly. Please wait a moment before trying again.' });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * AI Generation Endpoint
 * POST /api/ai/generate
 * Body: { type, input, context }
 */
router.post('/generate', ensureAuthenticated, aiLimiter, aiController.generateAI);

module.exports = router;
