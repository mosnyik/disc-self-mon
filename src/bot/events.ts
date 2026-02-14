import { Client, GuildMember, TextChannel } from 'discord.js-selfbot-v13';
import { Config, Credentials } from '../types';
import { raidDetector } from '../services/raid-detector';
import { getAccountAge } from '../utils/helpers';

export function setupReadyEvent(client: Client, config: Config): void {
  client.once('ready', () => {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[Bot] Logged in as ${client.user?.tag}`);
    console.log(`[Bot] Serving ${client.guilds.cache.size} server(s)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Bot] Available servers:');

    client.guilds.cache.forEach(guild => {
      const isExempt = config.exemptServers.includes(guild.id);
      console.log(`  ${isExempt ? '○' : '✓'} ${guild.name} (${guild.id})`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Bot] Waiting for member joins...');
    console.log('[Tip] Edit config.json to exempt servers (hot-reload enabled)');
  });
}

export function setupMemberJoinEvent(
  client: Client,
  getConfig: () => Config,
  credentials: Credentials
): void {
  client.on('guildMemberAdd', async (member: GuildMember) => {
    const config = getConfig();

    // Skip exempt servers
    if (config.exemptServers.includes(member.guild.id)) return;

    try {
      // Check for raid
      let isRaid = false;
      let joinCount = 1;

      if (config.raidDetection?.enabled) {
        const result = raidDetector.addJoin(member.guild.id);
        isRaid = result.isRaid;
        joinCount = result.joinCount;

        if (isRaid) {
          console.log(
            `[RAID] Detected in ${member.guild.name}! ` +
            `${joinCount} joins in ${config.raidDetection.timeframe}s`
          );
        }
      }

      // Build message content
      const title = isRaid ? '🚨 RAID ALERT' : '👤 New Member';
      const accountAge = getAccountAge(member.user.createdAt);

      let content = `**${title}**\n`;
      content += `User: ${member.user.tag}\n`;
      content += `Server: ${member.guild.name}\n`;
      content += `Account Age: ${accountAge}\n`;

      if (isRaid) {
        content += `Joins: ${joinCount} in ${config.raidDetection.timeframe}s\n`;
        content += `Member Count: ${member.guild.memberCount}`;
      }

      // Send notification based on method
      if (credentials.notificationMethod === 'dm') {
        const recipient = await client.users.fetch(credentials.notifyId);
        await recipient.send(content);
      } else {
        const channel = await client.channels.fetch(credentials.notifyId) as TextChannel;
        if (channel && channel.isText()) {
          await channel.send(content);
        } else {
          console.error('[Error] Could not find notification channel or channel is not a text channel');
          return;
        }
      }

      // Log join
      const raidIndicator = isRaid ? ' [RAID]' : '';
      console.log(`[Join]${raidIndicator} ${member.user.tag} joined ${member.guild.name}`);

    } catch (error: any) {
      console.error('[Error] Failed to send notification:', error.message);
    }
  });
}

export function setupErrorEvents(client: Client): void {
  client.on('error', (error: any) => {
    const msg = error.message?.toLowerCase() || '';

    if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('invalid token')) {
      console.error('[Error] Account may be banned or token invalidated');
      console.error('[Error] Delete .env file and restart to reconfigure');
    } else {
      console.error('[Error] Discord client error:', error.message);
    }
  });

  client.on('disconnect', () => {
    console.error('[Warning] Disconnected from Discord');
  });
}
