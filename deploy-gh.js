const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.argv[2] || '';
const REPO_NAME = 'video_report_AI_react';
const DIST_DIR = path.join(__dirname, 'dist');
const STEP = process.argv[3] || 'all'; // step1=create_repo, step2=deploy_dist, step3=push_src

if (!TOKEN) {
  console.error('Usage: node deploy-gh.js <token> [step1|step2|step3|all]');
  process.exit(1);
}

function githubRequest(method, apiPath, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'api.github.com',
      path: apiPath,
      method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'deploy-script',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 400) reject({ status: res.statusCode, body: parsed });
          else resolve(parsed);
        } catch (e) { resolve(body); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function collectFiles(dir, base) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = (base ? base + '/' : '') + entry.name;
    if (entry.isDirectory()) files = files.concat(collectFiles(full, rel));
    else files.push({ path: rel, fullPath: full });
  }
  return files;
}

async function getUser() {
  const u = await githubRequest('GET', '/user');
  console.log('User:', u.login);
  return u.login;
}

async function step1_createRepo(owner) {
  console.log('\n== Step 1: Create Repo ==');
  try {
    const r = await githubRequest('GET', `/repos/${owner}/${REPO_NAME}`);
    console.log('Repo exists:', r.html_url);
  } catch (e) {
    if (e.status === 404) {
      console.log('Creating...');
      const r = await githubRequest('POST', '/user/repos', {
        name: REPO_NAME, description: 'AI高光点播', private: false, auto_init: true
      });
      console.log('Created:', r.html_url);
      await new Promise(r => setTimeout(r, 3000));
    } else throw e;
  }
}

async function step2_deployDist(owner) {
  console.log('\n== Step 2: Deploy dist to gh-pages ==');
  const files = collectFiles(DIST_DIR, '');
  console.log('Files:', files.length);

  const treeItems = [];
  for (const f of files) {
    const blob = await githubRequest('POST', `/repos/${owner}/${REPO_NAME}/git/blobs`, {
      content: fs.readFileSync(f.fullPath).toString('base64'), encoding: 'base64'
    });
    treeItems.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    console.log(' blob:', f.path);
  }

  const tree = await githubRequest('POST', `/repos/${owner}/${REPO_NAME}/git/trees`, { tree: treeItems });
  console.log('Tree:', tree.sha);

  // Get base commit
  let baseSha;
  try {
    const ref = await githubRequest('GET', `/repos/${owner}/${REPO_NAME}/git/ref/heads/gh-pages`);
    baseSha = ref.object.sha;
  } catch(e) {
    try {
      const ref = await githubRequest('GET', `/repos/${owner}/${REPO_NAME}/git/ref/heads/main`);
      baseSha = ref.object.sha;
    } catch(e2) {
      const ref = await githubRequest('GET', `/repos/${owner}/${REPO_NAME}/git/ref/heads/master`);
      baseSha = ref.object.sha;
    }
  }

  const commit = await githubRequest('POST', `/repos/${owner}/${REPO_NAME}/git/commits`, {
    message: 'Deploy to GitHub Pages', tree: tree.sha, parents: [baseSha]
  });
  console.log('Commit:', commit.sha);

  try {
    await githubRequest('PATCH', `/repos/${owner}/${REPO_NAME}/git/refs/heads/gh-pages`, {
      sha: commit.sha, force: true
    });
    console.log('Updated gh-pages');
  } catch(e) {
    await githubRequest('POST', `/repos/${owner}/${REPO_NAME}/git/refs`, {
      ref: 'refs/heads/gh-pages', sha: commit.sha
    });
    console.log('Created gh-pages');
  }

  // Enable Pages
  try {
    await githubRequest('POST', `/repos/${owner}/${REPO_NAME}/pages`, {
      source: { branch: 'gh-pages', path: '/' }
    });
    console.log('Pages enabled');
  } catch(e) {
    console.log('Pages status:', e.status || 'ok');
  }

  console.log(`\nDone! https://${owner}.github.io/${REPO_NAME}/`);
}

async function step3_pushSrc(owner) {
  console.log('\n== Step 3: Push source to main ==');
  const SKIP = new Set(['node_modules','dist','.git','.codebuddy','deploy-github.js','deploy-gh.js','package-lock.json']);
  const srcFiles = [];
  
  function walk(dir, base) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP.has(e.name)) continue;
      const full = path.join(dir, e.name);
      const rel = base ? base + '/' + e.name : e.name;
      if (e.isDirectory()) walk(full, rel);
      else if (fs.statSync(full).size < 1024*1024) srcFiles.push({ path: rel, fullPath: full });
    }
  }
  walk(__dirname, '');
  console.log('Source files:', srcFiles.length);

  const items = [];
  for (const f of srcFiles) {
    const blob = await githubRequest('POST', `/repos/${owner}/${REPO_NAME}/git/blobs`, {
      content: fs.readFileSync(f.fullPath).toString('base64'), encoding: 'base64'
    });
    items.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    process.stdout.write('.');
  }
  console.log('\nBlobs done');

  const tree = await githubRequest('POST', `/repos/${owner}/${REPO_NAME}/git/trees`, { tree: items });
  
  let mainRef;
  try { mainRef = await githubRequest('GET', `/repos/${owner}/${REPO_NAME}/git/ref/heads/main`); }
  catch(e) { mainRef = await githubRequest('GET', `/repos/${owner}/${REPO_NAME}/git/ref/heads/master`); }

  const commit = await githubRequest('POST', `/repos/${owner}/${REPO_NAME}/git/commits`, {
    message: 'Source code: AI高光点播 React App', tree: tree.sha, parents: [mainRef.object.sha]
  });

  const branch = mainRef.ref.includes('main') ? 'main' : 'master';
  await githubRequest('PATCH', `/repos/${owner}/${REPO_NAME}/git/refs/heads/${branch}`, {
    sha: commit.sha, force: true
  });
  console.log('Source pushed to', branch);
}

async function main() {
  try {
    const owner = await getUser();
    if (STEP === 'all' || STEP === 'step1') await step1_createRepo(owner);
    if (STEP === 'all' || STEP === 'step2') await step2_deployDist(owner);
    if (STEP === 'all' || STEP === 'step3') await step3_pushSrc(owner);
    console.log('\n🎉 All done!');
  } catch(err) {
    console.error('Error:', JSON.stringify(err, null, 2));
    process.exit(1);
  }
}
main();
