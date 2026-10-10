const { runInDocker } = require('./dockerRunner');
const { MAX_CODE_LENGTH } = require('./limits');

const executeCode = async ({ language, code }) => {
  if (!language || typeof language !== 'string') {
    return {
      success: false,
      stdout: '',
      stderr: 'Language parameter is required (supported: javascript, python, cpp)',
      executionTime: 0
    };
  }

  const normalizedLang = language.toLowerCase().trim();
  const validLanguages = ['javascript', 'python', 'cpp'];

  if (!validLanguages.includes(normalizedLang)) {
    return {
      success: false,
      stdout: '',
      stderr: `Invalid language '${language}'. Supported languages: ${validLanguages.join(', ')}`,
      executionTime: 0
    };
  }

  if (typeof code !== 'string' || !code.trim()) {
    return {
      success: false,
      stdout: '',
      stderr: 'Code cannot be empty',
      executionTime: 0
    };
  }

  if (code.length > MAX_CODE_LENGTH) {
    return {
      success: false,
      stdout: '',
      stderr: `Code length exceeds maximum allowed limit of ${MAX_CODE_LENGTH} characters`,
      executionTime: 0
    };
  }

  return await runInDocker(normalizedLang, code);
};

module.exports = { executeCode };
