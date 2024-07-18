const { execSync } = require('child_process');

const filePath = 'backend/configs/db.js';

try {
  const result = execSync('git diff --cached --name-only').toString();
  const isFileStaged = result.includes(filePath);
  if (isFileStaged) {
    console.log(`${filePath} is staged.`);
  } else {
    console.log(`${filePath} is not staged.`);
  }
} catch (error) {
  console.error('Error checking staged files:', error);
}
