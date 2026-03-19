const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvController');
const { ensureAuthenticated } = require('../middleware/auth');

const exportController = require('../controllers/exportController');

router.get('/dashboard', ensureAuthenticated, cvController.getDashboard);
router.get('/cv-editor/create', ensureAuthenticated, cvController.getCreateCV);
router.post('/cv-editor/create', ensureAuthenticated, cvController.postCreateCV);
router.get('/cv-editor/:id', ensureAuthenticated, cvController.getEditCV);
router.post('/cv-editor/:id', ensureAuthenticated, cvController.postUpdateCV);
router.get('/cv-editor/:id/delete', ensureAuthenticated, cvController.deleteCV);
router.get('/cv-editor/:id/export', ensureAuthenticated, exportController.exportPDF);

module.exports = router;
