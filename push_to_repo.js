const { execSync } = require('child_process');
const fs = require('fs');

const candidates = [
  'C:\\Users\\WELCOME\\AppData\\Local\\Programs\\git\\cmd\\git.exe',
  'C:\\Users\\mbhat\\AppData\\Local\\Programs\\Git\\cmd\\git.exe',
  'git'
];

let gitExe = 'git';
for (const cand of candidates) {
  if (fs.existsSync(cand)) {
    gitExe = cand;
    break;
  }
}

const repoUrl = 'https://github.com/Gulshan6200/Ai-powered-food-redistribution-ecosystem.git';
const token = process.argv[2] || process.env.GITHUB_TOKEN;

if (!token) {
  console.log('Error: Please provide your GitHub Personal Access Token.');
  console.log('Usage: node push_to_repo.js <GITHUB_TOKEN>');
  process.exit(1);
}

const authRemoteUrl = `https://${token}@github.com/Gulshan6200/Ai-powered-food-redistribution-ecosystem.git`;

console.log('Pushing main branch to https://github.com/Gulshan6200/Ai-powered-food-redistribution-ecosystem ...');

try {
  execSync(`"${gitExe}" push -f -u "${authRemoteUrl}" main`, {
    stdio: 'inherit'
  });

  try {
    execSync(`"${gitExe}" remote remove origin`, { stdio: 'ignore' });
  } catch (e) {}
  execSync(`"${gitExe}" remote add origin ${repoUrl}`, { stdio: 'ignore' });

  console.log('\n======================================================');
  console.log('🎉 ALL CODE SUCCESSFULLY PUSHED TO GITHUB!');
  console.log('Repository URL: https://github.com/Gulshan6200/Ai-powered-food-redistribution-ecosystem');
  console.log('======================================================');
} catch (err) {
  console.error('\nPush failed. Please ensure the token has "repo" scope and is valid.');
  process.exit(1);
}
