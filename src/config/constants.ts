import path from 'path';
import { Config } from '../types';

// Determine base directory (exe location for packaged app, project root for dev)
const isPackaged = !!(process as any).pkg || process.execPath.includes('discord-mon');

export const BASE_DIR = isPackaged
  ? path.dirname(process.execPath)
  : path.join(__dirname, '..', '..');

export const CONFIG_PATH = path.join(BASE_DIR, 'config.json');
export const ENV_PATH = path.join(BASE_DIR, '.env');

export const DEFAULT_CONFIG: Config = {
  exemptServers: [],
  raidDetection: {
    enabled: true,
    threshold: 5,
    timeframe: 10
  }
};
