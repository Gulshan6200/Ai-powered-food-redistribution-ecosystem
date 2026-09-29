/**
 * Automated script to create GitHub repository and push local files
 * Usage:
 *   node deploy_to_github.js <GITHUB_USERNAME> <GITHUB_TOKEN>
 * Or set environment variables:
 *   $env:GITHUB_USER="your-username"
 *   $env:GITHUB_TOKEN="your-pat-token"
 *   node deploy_to_github.js
 */

const https = require('https');
const { execSync } = require('child_process');
const path = require('path');

const repoName = 'Smoothie-website';
const username = process.argv[2] || process.env.GITHUB_USER;
const token = process.argv[3] || process.env.GITHUB_TOKEN;

if (!username || !token) {
  console.log('======================================================');
  console.log('FoodCycle AI / Smoothie Website — GitHub Deploy Helper');
  console.log('======================================================');
  console.log('\nTo create the GitHub repository and push automatically, run:');
  console.log('  node deploy_to_github.js <YOUR_GITHUB_USERNAME> <YOUR_GITHUB_TOKEN>\n');
  console.log('Create a token at: https://github.com/settings/tokens/new (with "repo" scope)');
  console.log('======================================================');
  process.exit(1);
}

const gitExe = 'C:\\Users\\mbhat\\AppData\\Local\\Programs\\Git\\cmd\\git.exe';

async function createRepo() {
  console.log(`\n1. Creating repository "${repoName}" on GitHub for user "${username}"...`);
  
  const payload = JSON.stringify({
    name: repoName,
    description: 'FoodCycle AI / Smoothie Website - AI-Powered Food Waste Reduction & Sustainable Redistribution Platform',
    private: false,
    auto_init: false
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: '/user/repos',
      method: 'POST',
      headers: {
        'User-Agent': 'FoodCycle-Deploy-Bot',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode === 201) {
            console.log(`✅ GitHub repository created successfully: ${data.html_url}`);
            resolve(data);
          } else if (res.statusCode === 422 && body.includes('already exists')) {
            console.log(`ℹ️ Repository "${repoName}" already exists on your GitHub account. Proceeding to push...`);
            resolve({ clone_url: `https://github.com/${username}/${repoName}.git` });
          } else {
            console.error(`❌ GitHub API Error (${res.statusCode}):`, data.message || body);
            reject(new Error(data.message || 'Failed to create repository'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function pushFiles() {
  const remoteUrl = `https://${username}:${token}@github.com/${username}/${repoName}.git`;
  console.log('\n2. Configuring git remote origin...');
  
  try {
    execSync(`"${gitExe}" remote remove origin`, { stdio: 'ignore' });
  } catch (e) {}

  execSync(`"${gitExe}" remote add origin https://github.com/${username}/${repoName}.git`, { stdio: 'inherit' });
  
  console.log('\n3. Pushing main branch to GitHub...');
  execSync(`"${gitExe}" push -u "${remoteUrl}" main`, { stdio: 'inherit' });
  
  console.log('\n======================================================');
  console.log(`🎉 SUCCESS! All files pushed to: https://github.com/${username}/${repoName}`);
  console.log('======================================================');
  console.log('\nNext steps for Netlify:');
  console.log('1. Go to https://app.netlify.com');
  console.log(`2. Click "Add new site" -> "Import an existing project" -> Select GitHub.`);
  console.log(`3. Choose "${repoName}".`);
  console.log('4. Netlify will auto-detect netlify.toml and deploy your Vite client!');
}

createRepo()
  .then(() => pushFiles())
  .catch(err => {
    console.error('\nDeployment halted:', err.message);
    process.exit(1);
  });
