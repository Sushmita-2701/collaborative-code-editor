const express = require('express');
const router = express.Router();
const { updateFile, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All file routes are protected

router.route('/:id')
  .put(updateFile)
  .delete(deleteFile);

module.exports = router;
