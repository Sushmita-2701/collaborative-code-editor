const File = require('../models/File');
const Project = require('../models/Project');

// Helper to verify user access to project
const verifyProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;

  const isOwner = project.owner.toString() === userId.toString();
  const isCollaborator = project.collaborators.some(id => id.toString() === userId.toString());

  if (!isOwner && !isCollaborator) return false;
  return project;
};

// @desc    Create a new file or folder in a project
// @route   POST /api/projects/:projectId/files
// @access  Private
const createFile = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, path: inputPath, type = 'file', content = '' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const project = await verifyProjectAccess(projectId, req.user._id);
    if (project === null) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (project === false) {
      return res.status(403).json({ success: false, message: 'Not authorized for this project' });
    }

    // Determine normalized path
    let filePath = inputPath;
    if (!filePath) {
      filePath = `/${name.trim()}`;
    }
    if (!filePath.startsWith('/')) {
      filePath = `/${filePath}`;
    }

    // Check duplicate path
    const existing = await File.findOne({ project: projectId, path: filePath });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An item at path "${filePath}" already exists in this project`
      });
    }

    const file = await File.create({
      project: projectId,
      name: name.trim(),
      path: filePath,
      type: type === 'folder' ? 'folder' : 'file',
      content: type === 'folder' ? '' : content
    });

    res.status(201).json({
      success: true,
      file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update file content or rename
// @route   PUT /api/files/:id
// @access  Private
const updateFile = async (req, res, next) => {
  try {
    const { content, name, path: newPath } = req.body;
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const project = await verifyProjectAccess(file.project, req.user._id);
    if (!project) {
      return res.status(403).json({ success: false, message: 'Not authorized for this project' });
    }

    if (content !== undefined) {
      file.content = content;
    }

    if (name && name.trim()) {
      file.name = name.trim();
    }

    if (newPath && newPath.trim()) {
      const normalized = newPath.startsWith('/') ? newPath.trim() : `/${newPath.trim()}`;
      file.path = normalized;
    }

    await file.save();

    res.status(200).json({
      success: true,
      file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a file or folder (and its children)
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const project = await verifyProjectAccess(file.project, req.user._id);
    if (!project) {
      return res.status(403).json({ success: false, message: 'Not authorized for this project' });
    }

    if (file.type === 'folder') {
      // Delete any files/folders under this path prefix
      const prefix = file.path.endsWith('/') ? file.path : `${file.path}/`;
      await File.deleteMany({
        project: file.project,
        path: { $regex: `^${prefix}` }
      });
    }

    await File.findByIdAndDelete(file._id);

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
      deletedId: file._id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFile,
  updateFile,
  deleteFile
};
