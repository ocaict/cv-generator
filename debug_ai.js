require('dotenv').config();
const aiController = require('./src/controllers/aiController');
const { ensureAuthenticated } = require('./src/middleware/auth');
const rateLimit = require('express-rate-limit');

console.log('aiController.generate:', typeof aiController.generate);
console.log('aiController.chatAI:', typeof aiController.chatAI);
console.log('ensureAuthenticated:', typeof ensureAuthenticated);
console.log('rateLimit type:', typeof rateLimit);

try {
    const aiLimiter = rateLimit({ windowMs: 60000, max: 15 });
    console.log('aiLimiter type:', typeof aiLimiter);
} catch (e) {
    console.error('aiLimiter error:', e.message);
}
