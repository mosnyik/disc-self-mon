import { loadConfig, loadCredentials } from './config';
import { showMainMenu, printHeader } from './cli/menu';
import { setupCredentials, configureRaidDetection, configureExemptServers } from './cli/setup';
import { startBot } from './bot/client';
import { Credentials } from './types';

async function main(): Promise<void> {
  // Load config (creates default if missing)
  let config = loadConfig();

  // Check for existing credentials
  let credentials: Credentials | null = loadCredentials();

  // First-time setup
  if (!credentials) {
    printHeader('WELCOME TO DISCORD JOIN MONITOR');
    console.log('No configuration found. Let\'s set up the bot.');
    console.log('');
    credentials = await setupCredentials();
  }

  // Main menu loop
  let shouldStart = false;

  while (!shouldStart) {
    const choice = await showMainMenu();

    switch (choice || '1') {
      case '1':
        shouldStart = true;
        break;

      case '2':
        credentials = await setupCredentials();
        break;

      case '3':
        config = await configureRaidDetection(config);
        break;

      case '4':
        config = await configureExemptServers(config);
        break;

      case '5':
        console.log('\nGoodbye!');
        process.exit(0);

      default:
        console.log('Invalid option');
    }
  }

  // Start the bot
  await startBot(config, credentials);
}

// Run
main().catch(console.error);
