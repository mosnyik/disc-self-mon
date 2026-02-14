export interface Config {
  exemptServers: string[];
  raidDetection: RaidDetectionConfig;
}

export interface RaidDetectionConfig {
  enabled: boolean;
  threshold: number;
  timeframe: number;
}

export interface Credentials {
  token: string;
  notifyUserId: string;
}

export interface RaidCheckResult {
  isRaid: boolean;
  joinCount: number;
}
