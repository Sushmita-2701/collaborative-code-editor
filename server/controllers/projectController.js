const Project = require('../models/Project');
const File = require('../models/File');
const User = require('../models/User');

// @desc    Get all user's owned and shared projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    })
      .populate('owner', 'name email')
      .populate('collaborators', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project with starter files
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    const project = await Project.create({
      name: name.trim(),
      owner: req.user._id,
      collaborators: []
    });

    // Create starter files for the project
    const defaultFiles = [
      {
        project: project._id,
        name: 'index.js',
        path: '/index.js',
        type: 'file',
        content: `// JavaScript Playground\nfunction greet(name) {\n  return \`Hello, \${name}! Welcome to the real-time IDE.\`;\n}\n\nconsole.log(greet("${req.user.name}"));\n`
      },
      {
        project: project._id,
        name: 'app.py',
        path: '/app.py',
        type: 'file',
        content: `# Python Playground\ndef fibonacci(n):\n    sequence = [0, 1]\n    for i in range(2, n):\n        sequence.append(sequence[i - 1] + sequence[i - 2])\n    return sequence\n\nprint("Fibonacci series:", fibonacci(8))\n`
      },
      {
        project: project._id,
        name: 'main.cpp',
        path: '/main.cpp',
        type: 'file',
        content: `// C++ Playground\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> numbers = {1, 2, 3, 4, 5};\n    std::cout << "C++ Sandbox: Vector elements:" << std::endl;\n    for (int n : numbers) {\n        std::cout << " - " << n << std::endl;\n    }\n    return 0;\n}\n`
      }
    ];

    const createdFiles = await File.insertMany(defaultFiles);

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('collaborators', 'name email');

    res.status(201).json({
      success: true,
      project: populatedProject,
      files: createdFiles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID along with its files
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization: Owner or Collaborator
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators.some(
      collab => collab._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    const files = await File.find({ project: project._id }).sort({ type: -1, name: 1 });

    res.status(200).json({
      success: true,
      project,
      files
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project (rename or manage collaborators)
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const { name, collaboratorEmail } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators.includes(req.user._id);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    if (name && name.trim()) {
      project.name = name.trim();
    }

    if (collaboratorEmail && isOwner) {
      const userToAdd = await User.findOne({ email: collaboratorEmail.toLowerCase().trim() });
      if (!userToAdd) {
        return res.status(404).json({
          success: false,
          message: `User with email ${collaboratorEmail} was not found`
        });
      }

      if (userToAdd._id.toString() === project.owner.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Owner is already a collaborator'
        });
      }

      if (!project.collaborators.includes(userToAdd._id)) {
        project.collaborators.push(userToAdd._id);
      }
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('collaborators', 'name email');

    res.status(200).json({
      success: true,
      project: updatedProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project and its files
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only owner can delete project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can delete this project'
      });
    }

    await File.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.status(200).json({
      success: true,
      message: 'Project and all associated files deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
};
