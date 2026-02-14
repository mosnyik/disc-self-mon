import { prompt } from './prompt';

export async function showMainMenu(): Promise<string> {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('       DISCORD JOIN MONITOR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('  1. Start monitoring');
  console.log('  2. Reconfigure (token, notification method)');
  console.log('  3. Configure raid detection');
  console.log('  4. Configure exempt servers');
  console.log('  5. Exit');
  console.log('');

  return await prompt('Select option [1]: ');
}

export function printHeader(title: string): void {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`       ${title}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

export function printBox(title: string): void {
  console.log('┌──────────────────────────────────────┐');
  console.log(`│  ${title.padEnd(36)}│`);
  console.log('└──────────────────────────────────────┘');
  console.log('');
}
