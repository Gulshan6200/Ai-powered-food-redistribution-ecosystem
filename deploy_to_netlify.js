/**
 * Direct Netlify API Deployer
 * Deploys smoothie-website-netlify.zip directly to Netlify via REST API
 * 
 * Usage:
 *   node deploy_to_netlify.js <NETLIFY_AUTH_TOKEN> [SITE_NAME]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const token = process.argv[2] || process.env.NETLIFY_AUTH_TOKEN;
const requestedSiteName = process.argv[3] || 'smoothie-website-' + Math.random().toString(36).substring(2, 7);

if (!token) {
  console.error('Error: Netlify Personal Access Token is required.');
  console.error('Usage: node deploy_to_netlify.js <YOUR_NETLIFY_TOKEN>');
  process.exit(1);
}

const zipFilePath = path.join(__dirname, 'smoothie-website-netlify.zip');

if (!fs.existsSync(zipFilePath)) {
  console.error('Error: Zip file not found at:', zipFilePath);
  process.exit(1);
}

const zipStats = fs.statSync(zipFilePath);
console.log('====================================================');
console.log('🚀 DEPLOYING TO NETLIFY VIA REST API');
console.log('====================================================');
console.log(`Package: ${path.basename(zipFilePath)} (${(zipStats.size / 1024).toFixed(1)} KB)`);
console.log(`Target Site Name: ${requestedSiteName}`);

const zipData = fs.readFileSync(zipFilePath);

const options = {
  hostname: 'api.netlify.com',
  path: `/api/v1/sites?name=${encodeURIComponent(requestedSiteName)}`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/zip',
    'Content-Length': zipData.length,
    'User-Agent': 'FoodCycle-Deployer/1.0'
  }
};

console.log('\nUploading package to Netlify servers...');

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('\n====================================================');
        console.log('🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('====================================================');
        console.log(`🌐 Live Site URL:    ${data.ssl_url || data.url}`);
        console.log(`📦 Admin URL:        ${data.admin_url}`);
        console.log(`🆔 Site ID:          ${data.site_id || data.id}`);
        console.log(`⚡ State:            ${data.state}`);
        console.log('====================================================');
      } else {
        console.error(`\n❌ Netlify API Error (${res.statusCode}):`, data.message || body);
        process.exit(1);
      }
    } catch (err) {
      console.error('Error parsing response:', body);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('Request failed:', err.message);
  process.exit(1);
});

req.write(zipData);
req.end();
