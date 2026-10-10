export const getLanguageFromFilename = (filename) => {
  if (!filename) return 'javascript';
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'c':
    case 'h':
    case 'hpp':
      return 'cpp';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    default:
      return 'plaintext';
  }
};

export const getExecutableLanguage = (monacoLang) => {
  if (monacoLang === 'javascript' || monacoLang === 'typescript') return 'javascript';
  if (monacoLang === 'python') return 'python';
  if (monacoLang === 'cpp') return 'cpp';
  return null;
};
