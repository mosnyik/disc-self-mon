# Discord Join Monitor

A Discord selfbot that monitors server joins and sends DM notifications with member info. Can be packaged as a standalone Windows executable.

## Features

- Monitor multiple Discord servers for new member joins
- Receive DM notifications with user info (username, avatar, account age)
- Server whitelist with hot-reload (edit config while running)
- Package as standalone Windows exe

## Prerequisites

1. **Node.js** (v18 or higher)
2. **pnpm** package manager
3. **Discord User Token** - Your personal account token

## Getting Your Discord Token

1. Open Discord in a browser (not the desktop app)
2. Press `F12` to open Developer Tools
3. Go to the **Network** tab
4. Type `/api` in the filter box
5. Perform any action in Discord (send message, switch channels, etc.)
6. Click on any request and find the `Authorization` header - this is your token

## Installation

```bash
pnpm install
```

## Configuration

### Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in your credentials:

```env
BOT_TOKEN=your_discord_token_here
OWNER_ID=your_discord_user_id
```

| Variable | Description |
|----------|-------------|
| `BOT_TOKEN` | Your Discord user token |
| `OWNER_ID` | Your Discord user ID (notifications sent to yourself) |

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

This file supports hot-reload - edit while running and changes apply immediately.

### Getting IDs

1. Enable Developer Mode in Discord: Settings > App Settings > Advanced > Developer Mode
2. Right-click a server > "Copy Server ID"
3. Right-click your username > "Copy User ID"

## Usage

### Run in development

```bash
pnpm start
```

Displays all servers your account is in, with checkmarks for monitored ones:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Bot] Logged in as YourUsername#1234
[Bot] Serving 3 server(s)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Bot] Available servers:
  ✓ My Server (123456789)
  ○ Other Server (987654321)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Bot] Waiting for member joins...
```

### Hot-reload config

Edit `serverWhitelist` in `config.json` while running. Changes apply immediately without restart.

### Build Windows executable

```bash
pnpm build
```

Output: `dist/discord-mon.exe`

To run the exe, place both `.env` and `config.json` in the same folder as the executable.

## Notification Format

When someone joins a monitored server, you'll receive a DM with:

- Username
- Profile avatar
- Account age

## Disclaimer

Selfbots are against Discord's Terms of Service. Use at your own risk. Your account may be banned.

## License

MIT
