import fs from 'fs';
import { config as loadEnv } from 'dotenv';
import { Config, Credentials, NotificationMethod } from '../types';
import { CONFIG_PATH, ENV_PATH, DEFAULT_CONFIG } from './constants';

export function loadConfig(): Config {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.log('[Setup] Creating config.json with defaults...');
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8');
    console.log('[Setup] config.json created');
  }

  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsed: Config = JSON.parse(data);

    // Ensure raidDetection exists
    if (!parsed.raidDetection) {
      parsed.raidDetection = DEFAULT_CONFIG.raidDetection;
    }

    return parsed;
  } catch (error) {
    console.log('[Setup] Invalid config.json, recreating with defaults...');
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8');
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

export function loadCredentials(): Credentials | null {
  if (fs.existsSync(ENV_PATH)) {
    loadEnv({ path: ENV_PATH });
  }

  const token = process.env.MONITOR_TOKEN;
  const notificationMethod = process.env.NOTIFICATION_METHOD as NotificationMethod;
  const notifyId = process.env.NOTIFY_ID;

  // Check if valid
  if (token && token !== 'your_token_here' &&
      notificationMethod && (notificationMethod === 'dm' || notificationMethod === 'channel') &&
      notifyId && notifyId !== 'your_id_here') {
    return { token, notificationMethod, notifyId };
  }

  return null;
}

export function saveCredentials(credentials: Credentials): void {
  const envContent = [
    `MONITOR_TOKEN=${credentials.token}`,
    `NOTIFICATION_METHOD=${credentials.notificationMethod}`,
    `NOTIFY_ID=${credentials.notifyId}`
  ].join('\n') + '\n';

  fs.writeFileSync(ENV_PATH, envContent, 'utf8');
}

export { CONFIG_PATH, ENV_PATH, DEFAULT_CONFIG } from './constants';
