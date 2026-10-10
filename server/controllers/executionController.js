const { executeCode } = require('../sandbox/executionManager');

// @desc    Execute code in Docker sandbox
// @route   POST /api/execute
// @access  Private
const execute = async (req, res, next) => {
  try {
    const { language, code } = req.body;
    const result = await executeCode({ language, code });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { execute };
