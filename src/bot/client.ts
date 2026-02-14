import { Client } from 'discord.js-selfbot-v13';
import { Config, Credentials } from '../types';
import { raidDetector } from '../services/raid-detector';
import { ConfigWatcher } from '../services/config-watcher';
import { setupReadyEvent, setupMemberJoinEvent, setupErrorEvents } from './events';
import { prompt } from '../cli/prompt';

export async function startBot(config: Config, credentials: Credentials): Promise<void> {
  const { token, notifyUserId } = credentials;

  console.log('');
  console.log('[Bot] Starting Discord Join Monitor...');

  // Update raid detector settings
  if (config.raidDetection?.enabled) {
    raidDetector.updateSettings(config.raidDetection.threshold, config.raidDetection.timeframe);
    console.log(
      `[Config] Raid detection: ${config.raidDetection.threshold} joins ` +
      `in ${config.raidDetection.timeframe}s`
    );
  } else {
    console.log('[Config] Raid detection: disabled');
  }

  console.log(`[Config] Exempting ${config.exemptServers.length} server(s)`);

  // Setup config watcher
  const configWatcher = new ConfigWatcher(config);
  configWatcher.start();

  // Create Discord client
  const client = new Client({});

  // Setup event handlers
  setupReadyEvent(client, configWatcher.getConfig());
  setupMemberJoinEvent(client, () => configWatcher.getConfig(), notifyUserId);
  setupErrorEvents(client);

  // Process event handlers
  process.on('unhandledRejection', (error: Error) => {
    console.error('[Error] Unhandled rejection:', error.message);
  });

  process.on('SIGINT', () => {
    console.log('\n[Bot] Shutting down...');
    configWatcher.stop();
    client.destroy();
    process.exit(0);
  });

  // Login
  console.log('[Bot] Logging in...');

  try {
    await client.login(token);
  } catch (error: any) {
    const msg = error.message?.toLowerCase() || '';

    if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('invalid token')) {
      console.error('[Error] Invalid token - your account may be banned');
      console.error('[Error] Delete .env file and restart to reconfigure');
    } else if (msg.includes('403') || msg.includes('forbidden')) {
      console.error('[Error] Access forbidden - your account may be restricted');
    } else {
      console.error('[Error] Failed to login:', error.message);
    }

    await prompt('\nPress Enter to exit...');
    process.exit(1);
  }
}
