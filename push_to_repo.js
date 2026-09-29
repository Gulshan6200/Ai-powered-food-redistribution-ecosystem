const { execSync } = require('child_process');

const gitExe = 'C:\\Users\\mbhat\\AppData\\Local\\Programs\\Git\\cmd\\git.exe';
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
  // Push to remote using authenticated URL
  const output = execSync(`"${gitExe}" push -u "${authRemoteUrl}" main`, {
    stdio: 'inherit'
  });

  // Ensure origin is stored cleanly without credentials in plaintext
  try {
    execSync(`"${gitExe}" remote remove origin`, { stdio: 'ignore' });
  } catch (e) {}
  execSync(`"${gitExe}" remote add origin ${repoUrl}`, { stdio: 'ignore' });

  console.log('\n======================================================');
  console.log('🎉 ALL CODE SUCCESSFULLY PUSHED TO GITHUB!');
  console.log('Repository URL: https://github.com/Gulshan6200/Ai-powered-food-redistribution-ecosystem');
  console.log('======================================================');
} catch (err) {
  console.error('\nPush failed. Please ensure the token has "repo" scope.');
  process.exit(1);
}
