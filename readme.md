# Steam Market Float Monitor Bot

A Node.js bot that monitors Steam Community Market listings for specific CS2 items, filters them by price and float value, and sends alerts to a Discord webhook.

---

## Features

- Monitors Steam Market listings in real-time
- Filters by:
  - Maximum price
  - Maximum float value
- Extracts:
  - Float values from Steam asset data
  - Item icons
- Sends alerts to Discord via webhook
- Lightweight polling system (no external dependencies)

---

## ⚙️ Setup

### 1. Steam API Key
Get your API key here:
https://steamcommunity.com/dev/apikey

### 2. Discord Webhook
Create a webhook in your Discord server.

### 3. Config file
Create a `config.js` file (example provided in the project).

---

## Run

Make sure you are using Node.js v18+ for fetch:

```bash
node index.js