# Vyapaar-AI

> AI-powered Indian bargaining & negotiation automation system

![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![n8n](https://img.shields.io/badge/n8n-workflow-orange) ![Telegram](https://img.shields.io/badge/Telegram-Bot-blue) ![License](https://img.shields.io/badge/license-MIT-brightgreen)

---

## What is Vyapaar-AI?

Vyapaar-AI is a production-ready negotiation automation engine built specifically for **Indian retail & e-commerce context**. It handles Hinglish bargaining conversations via Telegram, runs multi-turn price negotiation logic, and integrates directly with n8n workflows.

---

## Project Structure

```
vyapaar-ai/
├── n8n-workflows/
│   └── tg-negotiator.json     # Import this into n8n directly
├── src/
│   ├── controllers/
│   │   └── negotiator.js      # Core bargaining algorithm
│   └── index.js               # Express webhook server
├── .gitignore
├── package.json
└── README.md
```

---

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/mehul82099/vyapaar-ai.git
cd vyapaar-ai
npm install
```

### 2. Run the Server
```bash
npm start
# Server runs on http://localhost:3000
```

### 3. Test the Negotiation Engine
```bash
npm test
# Output: { status: 'NEGOTIATING', counterOffer: 1380, reply: '...', nextTurn: 2 }
```

### 4. API Endpoint
```
POST http://localhost:3000/negotiate
Content-Type: application/json

{
  "chatId": "123456789",
  "message": "800 mein de do bhaiya",
  "mrp": 1500,
  "minPrice": 1100
}
```

---

## n8n Telegram Integration

1. Open your n8n instance
2. Click **Import** → select `n8n-workflows/tg-negotiator.json`
3. Add your Telegram Bot credentials
4. Change `MRP` and `MIN_PRICE` in the Code node
5. Activate workflow

### Workflow Pipeline
```
[Telegram Trigger] --> [Negotiator Logic] --> [Send Reply]
```

---

## Negotiation Logic

| Scenario | Turn | Result |
|----------|------|--------|
| Offer >= MRP | Any | SOLD instantly |
| Offer >= minPrice | Turn 2+ | SOLD |
| Offer < minPrice | Turn 1-2 | Counter-offer sent |
| Offer < minPrice | Turn 3+ | WALKAWAY message |
| No price in message | Any | Intent classified |

---

## Tech Stack

- **Node.js** - Core negotiation engine
- **Express.js** - Webhook server
- **n8n** - Workflow automation
- **Telegram Bot API** - Customer interface

---

## License

MIT © mehul82099
