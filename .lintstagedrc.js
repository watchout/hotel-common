module.exports = {
  '*.{ts,tsx,js,jsx}': (filenames) => {
    const filtered = filenames.filter(
      (f) => !f.includes('/dist/') && 
             !f.startsWith('dist/') && 
             !f.includes('/backup/') && 
             !f.startsWith('backup/') && 
             !f.includes('/backups/') && 
             !f.startsWith('backups/') && 
             !f.startsWith('docs-backup-')
    );
    if (filtered.length === 0) return [];
    return [
      `eslint --fix ${filtered.join(' ')}`,
      `eslint --max-warnings=700 ${filtered.join(' ')}`
    ];
  },
  '*.{json,md,yml,yaml}': (filenames) => {
    const filtered = filenames.filter(
      (f) => !f.includes('/dist/') && 
             !f.startsWith('dist/') && 
             !f.includes('/backup/') && 
             !f.startsWith('backup/') && 
             !f.includes('/backups/') && 
             !f.startsWith('backups/') && 
             !f.startsWith('docs-backup-')
    );
    if (filtered.length === 0) return [];
    return `prettier --write ${filtered.join(' ')}`;
  }
};

