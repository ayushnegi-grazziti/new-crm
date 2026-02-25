const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', leadController.createLead);
router.get('/', leadController.getLeads);
router.get('/:id', leadController.getLead);
router.patch('/:id/status', leadController.updateStatus);
router.patch('/:id', leadController.updateLead);
router.post('/:id/convert', leadController.convertLead);



module.exports = router;
