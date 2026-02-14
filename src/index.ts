import { loadConfig, loadCredentials } from './config';
import { showMainMenu } from './cli/menu';
import { setupCredentials, configureRaidDetection, configureExemptServers } from './cli/setup';
import { startBot } from './bot/client';

async function main(): Promise<void> {
  // Load config and credentials
  let config = loadConfig();
  let credentials = loadCredentials() || await setupCredentials();

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
