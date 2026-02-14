// import { Client, GatewayIntentBits, EmbedBuilder, GuildMember } from 'discord.js';
import { Client, MessageEmbed } from "discord.js-selfbot-v13"; 
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { config as loadEnv } from 'dotenv';

interface Config {
  serverWhitelist: string[];
}

// Determine base directory (exe location for pkg, project root for dev)
const isPkg = (process as NodeJS.Process & { pkg?: unknown }).pkg !== undefined;
const BASE_DIR = isPkg
  ? path.dirname(process.execPath)
  : path.join(__dirname, '..');

// Load .env from base directory
loadEnv({ path: path.join(BASE_DIR, '.env') });

const CONFIG_PATH = path.join(BASE_DIR, 'config.json');

// Load env variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const OWNER_ID = process.env.OWNER_ID;

// Validate env variables
if (!BOT_TOKEN || BOT_TOKEN === 'your_bot_token_here') {
  console.error('[Error] Please set BOT_TOKEN in .env file');
  process.exit(1);
}

if (!OWNER_ID || OWNER_ID === 'your_discord_user_id') {
  console.error('[Error] Please set OWNER_ID in .env file');
  process.exit(1);
}

let config: Config = loadConfig();

function loadConfig(): Config {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsed: Config = JSON.parse(data);
    console.log('[Config] Loaded successfully');
    console.log(`[Config] Monitoring ${parsed.serverWhitelist.length} server(s)`);
    return parsed;
  } catch (error) {
    const err = error as Error;
    console.error('[Config] Error loading config.json:', err.message);
    process.exit(1);
  }
}

function reloadConfig(): void {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsed: Config = JSON.parse(data);
    config.serverWhitelist = parsed.serverWhitelist;
    console.log('[Config] Reloaded - now monitoring', config.serverWhitelist.length, 'server(s)');
  } catch (error) {
    const err = error as Error;
    console.error('[Config] Error reloading config.json:', err.message);
  }
}

// Watch config file for changes
const watcher = chokidar.watch(CONFIG_PATH, {
  persistent: true,
  ignoreInitial: true
});

watcher.on('change', () => {
  console.log('[Config] File changed, reloading...');
  reloadConfig();
});



// Use the latest maintained fork settings
const client = new Client({
  // patchVoice: true    // Necessary if you plan to use voice features in 2026
});

client.once('ready', () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Bot] Logged in as ${client.user?.tag}`);
  console.log(`[Bot] Serving ${client.guilds.cache.size} server(s)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[Bot] Available servers:');
  client.guilds.cache.forEach(guild => {
    const isMonitored = config.serverWhitelist.includes(guild.id);
    console.log(`  ${isMonitored ? '✓' : '○'} ${guild.name} (${guild.id})`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[Bot] Waiting for member joins...');
  console.log('[Tip] Edit config.json to add/remove servers (hot-reload enabled)');
});

client.on("guildMemberAdd", async (member) => {
  if (!config.serverWhitelist.includes(member.guild.id)) return;

  try {
    // In v13, use MessageEmbed instead of EmbedBuilder
    const embed = new MessageEmbed()
      .setColor("#5865F2")
      .setTitle("New Member Detected")
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "User", value: member.user.tag, inline: true },
        {
          name: "Account Age",
          value: getAccountAge(member.user.createdAt),
          inline: true,
        },
      )
      .setTimestamp();

    // Selfbots send DMs to the OWNER_ID (you) the same way as bots
    const owner = await client.users.fetch(OWNER_ID!);
    await owner.send({ embeds: [embed] });
  } catch (error: any) {
    console.error(
      "[Detection Risk] Failed to send notification:",
      error.message,
    );
  }
});
function getAccountAge(createdAt: Date): string {
  const now = new Date();
  const diff = now.getTime() - createdAt.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}mo`);
  if (remainingDays > 0 || parts.length === 0) parts.push(`${remainingDays}d`);

  return parts.join(' ');
}

// Handle errors
client.on('error', (error: Error) => {
  console.error('[Error] Discord client error:', error.message);
});

process.on('unhandledRejection', (error: Error) => {
  console.error('[Error] Unhandled rejection:', error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Bot] Shutting down...');
  watcher.close();
  client.destroy();
  process.exit(0);
});

// Login
console.log('[Bot] Starting...');
client.login(BOT_TOKEN).catch((error: Error) => {
  console.error('[Error] Failed to login:', error.message);
  process.exit(1);
});
