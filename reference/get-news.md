# get-news.ps1 - News Aggregator

## Overview
RSS feed aggregator that displays latest news from multiple sources with auto-refresh and interactive selection.

## Usage
```powershell
.\scripts\get-news.ps1              # Run with default config
.\scripts\get-news.ps1 -Test        # Test mode (no interactive loop)
.\scripts\get-news.ps1 -ConfigFile custom-config.toml
```

## Configuration
- **Config File**: `scripts/get-news.toml` (default)
- **Sources**: Hacker News, BBC, CNN, NPR, DR.dk, AI sources
- **Settings**: Refresh interval, max items, max age days

## Features
- Real-time RSS feed aggregation
- Relative timestamps (e.g., "5 min", "2 hours", "Yesterday")
- Category color coding (AI/Tech/World/Denmark)
- Interactive menu (1-9, a-k for article selection)
- Auto-refresh with countdown
- Open articles in browser

## Commands
- **1-9, a-k**: Open corresponding article
- **R**: Manual refresh
- **Q**: Quit

## Best Practices
**PowerShell Scripts**: Add `-Test` switch to bypass interactive loops for debugging
- Source script with `. .\get-news.ps1 -Test` to access internal variables
- Use `$script:variableName` to inspect state after test runs
