# Discord Join Monitor

A Discord bot that monitors server joins and sends you DM notifications with detailed member info. Can be packaged as a standalone Windows executable.

## Features

- Monitor multiple Discord servers for new member joins
- Receive DM notifications with detailed info (username, avatar, account age, server name, member count)
- Server whitelist with hot-reload (edit config while bot runs)
- Package as standalone Windows exe

## Prerequisites

1. **Node.js** (v18 or higher)
2. **pnpm** package manager
3. **Discord Bot Token** - Create at https://discord.com/developers/applications

## Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section and click "Add Bot"
4. Copy the bot token
5. **Enable "Server Members Intent"** under Privileged Gateway Intents (required!)
6. Go to "OAuth2" > "URL Generator"
   - Select `bot` scope
   - Select `Send Messages` permission
7. Use the generated URL to invite the bot to your servers

## Installation

```bash
pnpm install
```

## Configuration

### Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in your credentials:

```env
BOT_TOKEN=your_bot_token_here
OWNER_ID=your_discord_user_id
```

| Variable | Description |
|----------|-------------|
| `BOT_TOKEN` | Your Discord bot token |
| `OWNER_ID` | Your Discord user ID (to receive DMs) |

### Server Whitelist (`config.json`)

Edit `config.json` to specify which servers to monitor:

```json
{
  "serverWhitelist": [
    "SERVER_ID_1",
    "SERVER_ID_2"
  ]
}
```

This file supports hot-reload - edit while the bot is running and changes apply immediately.

### Getting IDs

1. Enable Developer Mode in Discord: Settings > App Settings > Advanced > Developer Mode
2. Right-click a server > "Copy Server ID"
3. Right-click your username > "Copy User ID"

## Usage

### Run in development

```bash
pnpm start
```

The bot will display all servers it's in, with checkmarks for monitored ones:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Bot] Logged in as MonitorBot#1234
[Bot] Serving 3 server(s)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Bot] Available servers:
  ✓ My Server (123456789)
  ○ Other Server (987654321)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Bot] Waiting for member joins...
```

### Hot-reload config

Edit `serverWhitelist` in `config.json` while the bot is running. Changes apply immediately without restart.

### Build Windows executable

```bash
pnpm build
```

Output: `dist/discord-mon.exe`

To run the exe, place both `.env` and `config.json` in the same folder as the executable.

## Notification Format

When someone joins a monitored server, you'll receive a DM with:

- Username and user ID
- Profile avatar
- Server name and current member count
- Account creation date and age

## License

MIT
