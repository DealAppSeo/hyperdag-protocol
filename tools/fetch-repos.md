# Fetch Repos Script

This is the script used to generate the repository inventory.

```javascript
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const headers = { 'User-Agent': 'node.js' };

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    }).on('error', reject);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      if (res.statusCode >= 400) return resolve('');
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching public repositories from GitHub API...');
  const reposUrl = 'https://api.github.com/users/DealAppSeo/repos?per_page=100';
  const publicRepos = await fetchJson(reposUrl);
  
  if (!publicRepos || !Array.isArray(publicRepos)) {
    console.error('Failed to fetch public repos', publicRepos);
    return;
  }
  
  let md = '# DealAppSeo Repository Inventory\n\n';
  md += '| Repo Name | Visibility | Default Branch | Stars/Watchers | Open PRs | Last Commit Date | Last Commit Message | Summary |\n';
  md += '|---|---|---|---|---|---|---|---|\n';
  
  const processedNames = new Set();
  
  // Process Public Repos
  for (const repo of publicRepos) {
    const name = repo.name;
    processedNames.add(name.toLowerCase());
    const visibility = repo.private ? 'Private' : 'Public';
    const branch = repo.default_branch;
    const stars = `${repo.stargazers_count}/${repo.watchers_count}`;
    
    let lastCommitDate = repo.pushed_at ? repo.pushed_at.split('T')[0] : 'N/A';
    let lastCommitMsg = 'N/A';
    const commitsUrl = `https://api.github.com/repos/DealAppSeo/${name}/commits/${branch}`;
    const commitData = await fetchJson(commitsUrl);
    if (commitData && commitData.commit) {
      lastCommitDate = commitData.commit.author.date.split('T')[0];
      lastCommitMsg = commitData.commit.message.split('\n')[0].substring(0, 60).replace(/\|/g, '-');
    }
    
    let openPrs = 0;
    const pullsUrl = `https://api.github.com/repos/DealAppSeo/${name}/pulls?state=open`;
    const pullsData = await fetchJson(pullsUrl);
    if (Array.isArray(pullsData)) {
      openPrs = pullsData.length;
    }
    
    let summary = repo.description || '';
    if (!summary) {
      const pkgUrl = `https://raw.githubusercontent.com/DealAppSeo/${name}/${branch}/package.json`;
      const pkgText = await fetchText(pkgUrl);
      if (pkgText) {
        try {
          const pkgData = JSON.parse(pkgText);
          if (pkgData.description) summary = pkgData.description;
        } catch(e) {}
      }
      
      if (!summary) {
        const readmeUrl = `https://raw.githubusercontent.com/DealAppSeo/${name}/${branch}/README.md`;
        const readmeText = await fetchText(readmeUrl);
        if (readmeText) {
          const lines = readmeText.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
          if (lines.length > 0) summary = lines[0];
        }
      }
    }
    summary = summary.replace(/(\r\n|\n|\r)/gm, " ").replace(/\|/g, '-').trim();
    if (summary.length > 100) summary = summary.substring(0, 97) + '...';
    if (!summary) summary = 'No description available';
    
    md += `| ${name} | ${visibility} | ${branch} | ${stars} | ${openPrs} | ${lastCommitDate} | ${lastCommitMsg} | ${summary} |\n`;
    console.log(`Processed public repo: ${name}`);
  }
  
  // Process Local Repos (Potential Private Repos)
  const reposDir = 'C:\\Users\\Cash4\\repos';
  const dirs = fs.readdirSync(reposDir);
  for (const dir of dirs) {
    const fullPath = path.join(reposDir, dir);
    if (fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, '.git'))) {
      try {
        const remote = execSync('git remote -v', { cwd: fullPath, encoding: 'utf8' });
        if (remote.includes('DealAppSeo')) {
          const repoNameMatch = remote.match(/DealAppSeo\/([^\s.]+)(?:\.git)?/i);
          let name = repoNameMatch ? repoNameMatch[1] : dir;
          
          if (!processedNames.has(name.toLowerCase())) {
            processedNames.add(name.toLowerCase());
            const visibility = 'Private (Local)';
            const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: fullPath, encoding: 'utf8' }).trim();
            const stars = 'N/A';
            const openPrs = 'N/A';
            const lastCommitDate = execSync('git log -1 --format=%cd --date=short', { cwd: fullPath, encoding: 'utf8' }).trim();
            const lastCommitMsgRaw = execSync('git log -1 --format=%s', { cwd: fullPath, encoding: 'utf8' }).trim();
            const lastCommitMsg = lastCommitMsgRaw.substring(0, 60).replace(/\|/g, '-');
            
            let summary = '';
            if (fs.existsSync(path.join(fullPath, 'package.json'))) {
               try {
                 const pkg = JSON.parse(fs.readFileSync(path.join(fullPath, 'package.json'), 'utf8'));
                 if (pkg.description) summary = pkg.description;
               } catch(e) {}
            }
            if (!summary && fs.existsSync(path.join(fullPath, 'README.md'))) {
               const readme = fs.readFileSync(path.join(fullPath, 'README.md'), 'utf8');
               const lines = readme.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
               if (lines.length > 0) summary = lines[0];
            }
            summary = summary.replace(/(\r\n|\n|\r)/gm, " ").replace(/\|/g, '-').trim();
            if (summary.length > 100) summary = summary.substring(0, 97) + '...';
            if (!summary) summary = 'No description available';
            
            md += `| ${name} | ${visibility} | ${branch} | ${stars} | ${openPrs} | ${lastCommitDate} | ${lastCommitMsg} | ${summary} |\n`;
            console.log(`Processed local private repo: ${name}`);
          }
        }
      } catch (e) {
        // ignore repos that fail git commands
      }
    }
  }
  
  const targetDir = 'C:\\Users\\Cash4\\repos\\hyperdag-protocol\\docs';
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(path.join(targetDir, 'repo-inventory-2026-04-23.md'), md);
  console.log('Saved to repo-inventory-2026-04-23.md');
}

main().catch(console.error);
```
