// ============================================================
// Vyapaar-AI | src/index.js
// Express Webhook Server - Entry Point
// ============================================================

'use strict';

const express = require('express');
const { handleIndianBargain, classifyIntent } = require('./controllers/negotiator');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory session store (replace with Redis for production)
const sessions = {};

/**
 * POST /negotiate
 * Main negotiation endpoint called by n8n or Telegram webhook
 * Body: { chatId, message, mrp, minPrice }
 */
app.post('/negotiate', (req, res) => {
  try {
    const { chatId, message, mrp, minPrice } = req.body;

    if (!chatId || !mrp || !minPrice) {
      return res.status(400).json({ error: 'chatId, mrp, minPrice are required' });
    }

    // Get or initialize session for this chat
    if (!sessions[chatId]) {
      sessions[chatId] = { turnCount: 1 };
    }

    const { turnCount } = sessions[chatId];

    // Extract price from message or classify intent
    const priceMatch = message.match(/\d+/);
    let customerOffer = priceMatch ? parseInt(priceMatch[0]) : null;
    const intent = classifyIntent(message);

    // Handle AGREE intent without price
    if (intent === 'AGREE' && !customerOffer) {
      delete sessions[chatId];
      return res.json({
        status: 'SOLD',
        finalPrice: minPrice,
        reply: 'Done sir! Deal pakka. Payment link abhi bhej raha hun.',
        nextTurn: 0
      });
    }

    // Run negotiation algorithm
    const result = handleIndianBargain(
      Number(mrp),
      Number(minPrice),
      customerOffer,
      turnCount
    );

    // Update or clear session
    if (result.status === 'SOLD' || result.status === 'WALKAWAY') {
      delete sessions[chatId];
    } else {
      sessions[chatId].turnCount = result.nextTurn;
    }

    return res.json(result);

  } catch (err) {
    console.error('[Vyapaar-AI Error]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Vyapaar-AI Negotiation Engine', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Vyapaar-AI server running on port ${PORT}`);
});

module.exports = app;
