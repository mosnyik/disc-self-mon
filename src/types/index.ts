export interface Config {
  exemptServers: string[];
  raidDetection: RaidDetectionConfig;
}

export interface RaidDetectionConfig {
  enabled: boolean;
  threshold: number;
  timeframe: number;
}

export type NotificationMethod = 'dm' | 'channel';

export interface Credentials {
  token: string;
  notificationMethod: NotificationMethod;
  notifyId: string; // User ID for DM, Channel ID for channel
}

export interface RaidCheckResult {
  isRaid: boolean;
  joinCount: number;
}
