module.exports = {
  '*.{ts,tsx,js,jsx}': (filenames) => {
    const filtered = filenames.filter(
      (f) => !f.includes('dist/') && 
             !f.includes('backup/') &&
             !f.includes('node_modules/')
    );
    if (filtered.length === 0) return [];
    return [
      `eslint --fix ${filtered.join(' ')}`,
      `eslint --max-warnings=0 ${filtered.join(' ')}`
    ];
  },
  '*.{json,md,yml,yaml}': (filenames) => {
    const filtered = filenames.filter(
      (f) => !f.includes('dist/') && 
             !f.includes('backup/')
    );
    if (filtered.length === 0) return [];
    return `prettier --write ${filtered.join(' ')}`;
  }
};

