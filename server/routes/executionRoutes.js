const express = require('express');
const router = express.Router();
const { execute } = require('../controllers/executionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, execute);

module.exports = router;
