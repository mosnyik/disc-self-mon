import { Config, Credentials } from '../types';
import { saveConfig, saveCredentials } from '../config';
import { prompt } from './prompt';
import { printHeader, printBox } from './menu';

export async function setupCredentials(): Promise<Credentials> {
  console.log('');
  printHeader('DISCORD JOIN MONITOR - SETUP');

  console.log('This bot monitors Discord servers for new member joins');
  console.log('and sends DM notifications.');
  console.log('');

  // Step 1: Monitor Account Token
  printBox('STEP 1: MONITOR ACCOUNT TOKEN');

  console.log('This is the Discord account that will:');
  console.log('  • Run the selfbot');
  console.log('  • Monitor servers it has joined');
  console.log('  • Detect new member joins');
  console.log('');
  console.log('How to get the token:');
  console.log('  1. Open Discord in browser (not desktop app)');
  console.log('  2. Press F12 to open Developer Tools');
  console.log('  3. Go to Network tab');
  console.log('  4. Type /api in filter box');
  console.log('  5. Do something in Discord (send message)');
  console.log('  6. Click any request, find Authorization header');
  console.log('');

  const token = await prompt('Enter MONITOR ACCOUNT token: ');
  if (!token) {
    console.error('[Error] Token is required');
    process.exit(1);
  }

  // Step 2: Notification Recipient
  console.log('');
  printBox('STEP 2: NOTIFICATION RECIPIENT');

  console.log('This is the Discord account that will:');
  console.log('  • Receive DM notifications');
  console.log('  • Get alerts when members join');
  console.log('  • Get raid detection warnings');
  console.log('');
  console.log('This can be the SAME account as above, or DIFFERENT.');
  console.log('If different, both accounts must share a server or have DMs open.');
  console.log('');
  console.log('How to get User ID:');
  console.log('  1. Enable Developer Mode (Discord Settings > Advanced)');
  console.log('  2. Right-click username > Copy User ID');
  console.log('');

  const notifyUserId = await prompt('Enter NOTIFICATION RECIPIENT User ID: ');
  if (!notifyUserId) {
    console.error('[Error] Notification recipient ID is required');
    process.exit(1);
  }

  const credentials = { token, notifyUserId };
  saveCredentials(credentials);

  console.log('');
  console.log('[Setup] Settings saved to .env');

  return credentials;
}

export async function configureRaidDetection(config: Config): Promise<Config> {
  printHeader('RAID DETECTION SETTINGS');

  const enabledInput = await prompt(
    `Enable raid detection? (y/n) [${config.raidDetection.enabled ? 'y' : 'n'}]: `
  );

  if (enabledInput.toLowerCase() === 'y') {
    config.raidDetection.enabled = true;
  } else if (enabledInput.toLowerCase() === 'n') {
    config.raidDetection.enabled = false;
  }

  if (config.raidDetection.enabled) {
    const thresholdInput = await prompt(
      `Joins to trigger alert [${config.raidDetection.threshold}]: `
    );
    if (thresholdInput && !isNaN(parseInt(thresholdInput))) {
      config.raidDetection.threshold = parseInt(thresholdInput);
    }

    const timeframeInput = await prompt(
      `Timeframe in seconds [${config.raidDetection.timeframe}]: `
    );
    if (timeframeInput && !isNaN(parseInt(timeframeInput))) {
      config.raidDetection.timeframe = parseInt(timeframeInput);
    }
  }

  saveConfig(config);
  console.log('[Config] Raid detection settings saved');

  return config;
}

export async function configureExemptServers(config: Config): Promise<Config> {
  printHeader('EXEMPT SERVERS');

  console.log('Enter server IDs to EXCLUDE from monitoring.');
  console.log('(Right-click server > Copy Server ID)');
  console.log('');

  if (config.exemptServers.length > 0) {
    console.log('Current exempt servers:');
    config.exemptServers.forEach(id => console.log(`  - ${id}`));
    console.log('');

    const clearInput = await prompt('Clear existing list? (y/n) [n]: ');
    if (clearInput.toLowerCase() === 'y') {
      config.exemptServers = [];
    }
  }

  console.log('Enter server IDs one per line. Empty line to finish:');

  while (true) {
    const serverId = await prompt('  Server ID: ');
    if (!serverId) break;

    if (!config.exemptServers.includes(serverId)) {
      config.exemptServers.push(serverId);
    }
  }

  saveConfig(config);
  console.log(`[Config] ${config.exemptServers.length} server(s) exempted`);

  return config;
}
