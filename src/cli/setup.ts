import { Config, Credentials, NotificationMethod } from '../types';
import { saveConfig, saveCredentials } from '../config';
import { prompt } from './prompt';
import { printHeader, printBox } from './menu';

export async function setupCredentials(): Promise<Credentials> {
  console.log('');
  printHeader('DISCORD JOIN MONITOR - SETUP');

  console.log('This bot monitors Discord servers for new member joins');
  console.log('and sends notifications.');
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

  // Step 2: Notification Method
  console.log('');
  printBox('STEP 2: NOTIFICATION METHOD');

  console.log('How do you want to receive notifications?');
  console.log('');
  console.log('  1. DM (Direct Message to another account)');
  console.log('  2. Channel (Post to a Discord channel)');
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  ⚠ IMPORTANT: If you choose DM, the recipient must be  │');
  console.log('│  a DIFFERENT account than the monitor account above.   │');
  console.log('│  You cannot DM yourself! Use Channel mode instead.     │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log('');

  let notificationMethod: NotificationMethod;
  while (true) {
    const methodChoice = await prompt('Select notification method [1 or 2]: ');
    if (methodChoice === '1' || methodChoice === '') {
      notificationMethod = 'dm';
      break;
    } else if (methodChoice === '2') {
      notificationMethod = 'channel';
      break;
    }
    console.log('Please enter 1 or 2');
  }

  // Step 3: Notification Target
  console.log('');
  if (notificationMethod === 'dm') {
    printBox('STEP 3: DM RECIPIENT');

    console.log('This is the Discord account that will receive DMs.');
    console.log('');
    console.log('⚠ MUST be a DIFFERENT account than the monitor account!');
    console.log('  (Discord does not allow sending DMs to yourself)');
    console.log('');
    console.log('Both accounts must share a server or have DMs open.');
    console.log('');
    console.log('How to get User ID:');
    console.log('  1. Enable Developer Mode (Discord Settings > Advanced)');
    console.log('  2. Right-click username > Copy User ID');
    console.log('');

    const notifyId = await prompt('Enter RECIPIENT User ID: ');
    if (!notifyId) {
      console.error('[Error] User ID is required');
      process.exit(1);
    }

    const credentials = { token, notificationMethod, notifyId };
    saveCredentials(credentials);

    console.log('');
    console.log('[Setup] Settings saved to .env');
    console.log('[Setup] Notifications will be sent via DM');

    return credentials;

  } else {
    printBox('STEP 3: NOTIFICATION CHANNEL');

    console.log('This is the Discord channel where notifications will be posted.');
    console.log('');
    console.log('The monitor account must have permission to send messages');
    console.log('in this channel.');
    console.log('');
    console.log('How to get Channel ID:');
    console.log('  1. Enable Developer Mode (Discord Settings > Advanced)');
    console.log('  2. Right-click the channel > Copy Channel ID');
    console.log('');

    const notifyId = await prompt('Enter NOTIFICATION Channel ID: ');
    if (!notifyId) {
      console.error('[Error] Channel ID is required');
      process.exit(1);
    }

    const credentials = { token, notificationMethod, notifyId };
    saveCredentials(credentials);

    console.log('');
    console.log('[Setup] Settings saved to .env');
    console.log('[Setup] Notifications will be sent to channel');

    return credentials;
  }
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
