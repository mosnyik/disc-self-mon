# Discord Join Monitor

A Discord selfbot that monitors server joins and sends you DM notifications with raid detection.

## Features

- Monitor multiple Discord servers for new member joins
- **Raid Detection** - Alert when multiple users join rapidly
- DM notifications with user info (username, avatar, account age)
- Server exemption list with hot-reload
- **Simple setup** - Just run the exe and follow prompts
- Standalone Windows executable

## Quick Start

1. Download `discord-mon.exe`
2. Double-click to run
3. On first run, enter your Discord token and user ID
4. Select "Start monitoring" from menu
5. Done - bot is running

## Main Menu

On startup, you'll see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       DISCORD JOIN MONITOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Start monitoring
  2. Reconfigure (token, notification method)
  3. Configure raid detection
  4. Configure exempt servers
  5. Exit
```

All settings can be reconfigured anytime from this menu.

## Getting Your Discord Token

1. Open Discord in a browser (not desktop app)
2. Press `F12` to open Developer Tools
3. Go to the **Network** tab
4. Type `/api` in the filter box
5. Perform any action in Discord (send message, switch channels)
6. Click on any request and find the `Authorization` header - this is your token

## Getting Your User ID

1. Enable Developer Mode: Discord Settings > App Settings > Advanced > Developer Mode
2. Right-click your username > "Copy User ID"

## Configuration

After first run, two files are created next to the exe:

### `.env`
Contains your credentials (auto-generated during setup):
```env
MONITOR_TOKEN=your_token
NOTIFICATION_METHOD=dm
NOTIFY_ID=your_user_or_channel_id
```

| Variable | Description |
|----------|-------------|
| `MONITOR_TOKEN` | Discord token of the account running the selfbot (monitors servers) |
| `NOTIFICATION_METHOD` | Either `dm` or `channel` |
| `NOTIFY_ID` | User ID (for DM) or Channel ID (for channel notifications) |

> **Important:** If using DM notifications, the `NOTIFY_ID` must be a **different account** than the one used for `MONITOR_TOKEN`. Discord does not allow sending DMs to yourself. Use channel notifications if you only have one account.

### `config.json`
Customizable settings:
```json
{
  "exemptServers": [
    "SERVER_ID_TO_IGNORE"
  ],
  "raidDetection": {
    "enabled": true,
    "threshold": 5,
    "timeframe": 10
  }
}
```

| Option | Description |
|--------|-------------|
| `exemptServers` | Server IDs to exclude from monitoring |
| `raidDetection.enabled` | Enable/disable raid detection |
| `raidDetection.threshold` | Number of joins to trigger raid alert |
| `raidDetection.timeframe` | Time window in seconds |

Config supports hot-reload - edit while running and changes apply immediately.

## Notifications

### Normal Join
- Blue embed with username and account age

### Raid Alert
- Red "RAID ALERT" embed
- Server name, joins detected, member count

## Reconfiguring

Just run the exe and select from the menu:
- **Option 2** - Reconfigure (token, notification method, recipient)
- **Option 3** - Configure raid detection (enable/disable, threshold, timeframe)
- **Option 4** - Add/remove exempt servers

Or edit the config files directly - changes to `config.json` hot-reload while running.

## Planned Features

The following features are planned for future releases:

### Notification Methods
- [ ] Discord channel notifications (post to a specific channel)
- [ ] Discord webhook support (backup/alternative notification)
- [ ] Telegram integration (with profile picture support)

### Detection & Security
- [ ] Suspicious account detection (new accounts, no avatar)
- [ ] Configurable account age threshold for alerts
- [ ] Welcome channel monitoring (detect welcome embeds)

### Data & Analytics
- [ ] SQLite database for member history
- [ ] Analytics tracking (joins per day, suspicious count, raid count)
- [ ] `!stats` command for runtime statistics
- [ ] File-based logging system

### Enhanced Notifications
- [ ] User ID in embed
- [ ] Account creation date (Discord timestamp)
- [ ] Suspicious indicators in embed
- [ ] Guild statistics in notification (7-day summary)
- [ ] Member count in normal join notifications

### Configuration
- [ ] Server whitelist mode (monitor only specific servers)
- [ ] Per-server notification settings

## Building from Source

```bash
# Install dependencies
pnpm install

# Run in development
pnpm start

# Build Windows executable
pnpm build
```

Output: `dist/discord-mon.exe`

## Disclaimer

Selfbots are against Discord's Terms of Service. Use at your own risk. Your account may be banned.

## License

MIT
