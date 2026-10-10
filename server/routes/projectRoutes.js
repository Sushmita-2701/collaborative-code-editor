const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { createFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All project routes are protected

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

// Create file in project
router.post('/:projectId/files', createFile);

module.exports = router;
