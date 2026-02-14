import * as esbuild from 'esbuild';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const DIST_DIR = 'dist';
const RELEASE_DIR = 'dist/discord-mon';
const NODE_VERSION = '20.11.0';
const NODE_URL = `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-win-x64.zip`;

// Plugin to handle node:sqlite (optional module in undici)
const nodeSqlitePlugin = {
  name: 'node-sqlite-shim',
  setup(build) {
    build.onResolve({ filter: /^node:sqlite$/ }, () => ({
      path: 'node:sqlite',
      namespace: 'sqlite-shim'
    }));
    build.onLoad({ filter: /.*/, namespace: 'sqlite-shim' }, () => ({
      contents: 'module.exports = undefined;',
      loader: 'js'
    }));
  }
};

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url}...`);
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', reject);
  });
}

async function build() {
  console.log('='.repeat(50));
  console.log('Building Discord Join Monitor');
  console.log('='.repeat(50));

  // Step 1: Bundle with esbuild
  console.log('\n[1/4] Bundling code...');
  await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: `${DIST_DIR}/bundle.js`,
    external: [
      'fsevents',
      'ffmpeg-static',
      'opusscript',
      '@discordjs/opus',
      'bufferutil',
      'utf-8-validate',
      'erlpack',
      'zlib-sync'
    ],
    plugins: [nodeSqlitePlugin]
  });
  console.log('   Bundle created: dist/bundle.js');

  // Step 2: Create release directory
  console.log('\n[2/4] Creating release folder...');
  if (fs.existsSync(RELEASE_DIR)) {
    fs.rmSync(RELEASE_DIR, { recursive: true });
  }
  fs.mkdirSync(RELEASE_DIR, { recursive: true });

  // Step 3: Download portable Node.js if not cached
  const nodeZipPath = `${DIST_DIR}/node.zip`;
  const nodeExtractPath = `${DIST_DIR}/node-v${NODE_VERSION}-win-x64`;

  console.log('\n[3/4] Getting portable Node.js...');
  if (!fs.existsSync(nodeZipPath)) {
    await downloadFile(NODE_URL, nodeZipPath);
    console.log('   Downloaded Node.js');
  } else {
    console.log('   Using cached Node.js');
  }

  // Extract node.exe if needed
  if (!fs.existsSync(`${nodeExtractPath}/node.exe`)) {
    console.log('   Extracting...');
    execSync(`powershell -Command "Expand-Archive -Path '${nodeZipPath}' -DestinationPath '${DIST_DIR}' -Force"`, { stdio: 'inherit' });
  }

  // Copy node.exe to release
  fs.copyFileSync(`${nodeExtractPath}/node.exe`, `${RELEASE_DIR}/node.exe`);
  console.log('   Copied node.exe');

  // Step 4: Copy bundle and create launcher
  console.log('\n[4/4] Creating distribution...');

  // Copy bundle
  fs.copyFileSync(`${DIST_DIR}/bundle.js`, `${RELEASE_DIR}/bundle.js`);

  // Create launcher batch file
  const launcherContent = `@echo off
title Discord Join Monitor
cd /d "%~dp0"
node.exe bundle.js
pause
`;
  fs.writeFileSync(`${RELEASE_DIR}/discord-mon.bat`, launcherContent);

  // Create README
  const readmeContent = `Discord Join Monitor
====================

How to use:
1. Double-click "discord-mon.bat" to start
2. Follow the setup prompts on first run
3. Configuration is saved in this folder

Files:
- discord-mon.bat  : Double-click to run
- node.exe         : Node.js runtime (required)
- bundle.js        : Application code
- config.json      : Settings (created on first run)
- .env             : Credentials (created on first run)

Note: Keep all files in the same folder.
`;
  fs.writeFileSync(`${RELEASE_DIR}/README.txt`, readmeContent);

  // Create zip
  console.log('   Creating zip file...');
  const zipPath = `${DIST_DIR}/discord-mon-win64.zip`;
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  execSync(`powershell -Command "Compress-Archive -Path '${RELEASE_DIR}/*' -DestinationPath '${zipPath}'"`, { stdio: 'inherit' });

  console.log('\n' + '='.repeat(50));
  console.log('Build complete!');
  console.log('='.repeat(50));
  console.log(`\nOutput: ${zipPath}`);
  console.log(`\nContents:`);
  console.log('  - discord-mon.bat (launcher)');
  console.log('  - node.exe (runtime)');
  console.log('  - bundle.js (app)');
  console.log('  - README.txt');
}

build().catch(console.error);
