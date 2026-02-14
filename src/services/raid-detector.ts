import { RaidCheckResult } from '../types';

export class RaidDetector {
  private recentJoins: Map<string, number[]> = new Map();
  private threshold: number;
  private timeframe: number;

  constructor(threshold: number = 5, timeframe: number = 10) {
    this.threshold = threshold;
    this.timeframe = timeframe * 1000;
  }

  updateSettings(threshold: number, timeframe: number): void {
    this.threshold = threshold;
    this.timeframe = timeframe * 1000;
  }

  addJoin(guildId: string): RaidCheckResult {
    const now = Date.now();
    const cutoff = now - this.timeframe;

    let joins = this.recentJoins.get(guildId) || [];
    joins = joins.filter(timestamp => timestamp > cutoff);
    joins.push(now);
    this.recentJoins.set(guildId, joins);

    return {
      isRaid: joins.length >= this.threshold,
      joinCount: joins.length
    };
  }

  getRecentCount(guildId: string): number {
    const now = Date.now();
    const cutoff = now - this.timeframe;
    const joins = this.recentJoins.get(guildId) || [];
    return joins.filter(timestamp => timestamp > cutoff).length;
  }

  clear(guildId: string): void {
    this.recentJoins.delete(guildId);
  }
}

// Singleton instance
export const raidDetector = new RaidDetector();
