import chokidar, { FSWatcher } from 'chokidar';
import fs from 'fs';
import { Config } from '../types';
import { CONFIG_PATH } from '../config/constants';
import { raidDetector } from './raid-detector';

export class ConfigWatcher {
  private watcher: FSWatcher | null = null;
  private config: Config;
  private onChange?: (config: Config) => void;

  constructor(initialConfig: Config) {
    this.config = initialConfig;
  }

  start(onChange?: (config: Config) => void): void {
    this.onChange = onChange;

    this.watcher = chokidar.watch(CONFIG_PATH, {
      persistent: true,
      ignoreInitial: true
    });

    this.watcher.on('change', () => this.handleChange());
  }

  private handleChange(): void {
    console.log('[Config] File changed, reloading...');

    try {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      const parsed: Config = JSON.parse(data);

      this.config.exemptServers = parsed.exemptServers || [];

      if (parsed.raidDetection) {
        this.config.raidDetection = parsed.raidDetection;
        raidDetector.updateSettings(
          parsed.raidDetection.threshold,
          parsed.raidDetection.timeframe
        );
      }

      console.log('[Config] Reloaded - exempting', this.config.exemptServers.length, 'server(s)');

      if (this.onChange) {
        this.onChange(this.config);
      }
    } catch (error) {
      console.error('[Config] Error reloading:', (error as Error).message);
    }
  }

  getConfig(): Config {
    return this.config;
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}
