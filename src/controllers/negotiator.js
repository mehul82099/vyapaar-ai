// ============================================================
// Vyapaar-AI | src/controllers/negotiator.js
// Indian Bargaining Negotiation Engine v1.0
// Author: Vyapaar-AI Team | License: MIT
// ============================================================

'use strict';

/**
 * @typedef {Object} NegotiationResult
 * @property {'SOLD'|'NEGOTIATING'|'WALKAWAY'} status
 * @property {number} [finalPrice]
 * @property {number} [counterOffer]
 * @property {string} reply
 * @property {number} nextTurn
 */

/**
 * Core Indian Bargaining Algorithm
 * Handles multi-turn price negotiation with cultural context
 *
 * @param {number} mrp          - Maximum Retail Price (INR)
 * @param {number} minPrice     - Seller's absolute floor price (INR)
 * @param {number} customerOffer - Customer's current bid (INR)
 * @param {number} turnCount    - Current negotiation round (1-indexed)
 * @returns {NegotiationResult}
 */
function handleIndianBargain(mrp, minPrice, customerOffer, turnCount = 1) {

  // --- Input Validation ---
  if (!mrp || mrp <= 0) throw new Error('INVALID_MRP: MRP must be a positive number');
  if (!minPrice || minPrice <= 0) throw new Error('INVALID_MIN_PRICE');
  if (minPrice >= mrp) throw new Error('INVALID_MARGIN: minPrice must be less than MRP');
  if (!customerOffer || customerOffer <= 0) {
    return {
      status: 'NEGOTIATING',
      reply: `Bhaiya price batao, deal karte hain. Yeh product ₹${mrp} ka hai, best offer lagaunga.`,
      nextTurn: turnCount
    };
  }

  const offer = Number(customerOffer);
  const margin = mrp - minPrice;

  // --- Rule 1: Instant Accept (offer at or above MRP) ---
  if (offer >= mrp) {
    return {
      status: 'SOLD',
      finalPrice: mrp,
      reply: `Done sir! Bilkul sahi price hai. ₹${mrp} mein pakka. Payment link bhej raha hun abhi.`,
      nextTurn: 0
    };
  }

  // --- Rule 2: Accept if offer >= minPrice on Turn 2+ ---
  if (offer >= minPrice && turnCount >= 2) {
    return {
      status: 'SOLD',
      finalPrice: offer,
      reply: `Chaliye theek hai, aapka bhi na mera. ₹${offer} mein final karte hain. Ek dum last price!`,
      nextTurn: 0
    };
  }

  // --- Rule 3: Offer is below floor price ---
  if (offer < minPrice) {

    // Turn 3+: Firm Walkaway Warning
    if (turnCount >= 3) {
      return {
        status: 'WALKAWAY',
        reply: `Bhaiya, ₹${minPrice} se ek paisa bhi kam nahi hoga. Humari kharid hi itni hai. Apna time waste mat karo. Truly last price yahi hai.`,
        nextTurn: turnCount + 1
      };
    }

    // Early turns: Calculate a strategic counter-offer
    // Counter moves 30% closer to minPrice per turn
    const discount = margin * (0.3 * turnCount);
    const counter = Math.round(mrp - discount);

    return {
      status: 'NEGOTIATING',
      counterOffer: counter,
      reply: `Arey sir, ₹${offer} mein toh humara cost bhi nahi niklega! Quality product hai. Chalo aapke liye special ₹${counter} final kar deta hun. Bilkul last offer.`,
      nextTurn: turnCount + 1
    };
  }

  // --- Rule 4: Offer between minPrice and MRP on Turn 1 ---
  const midCounter = Math.round((offer + mrp) / 2);
  return {
    status: 'NEGOTIATING',
    counterOffer: midCounter,
    reply: `Sir ₹${offer} mein thoda tough hai. ₹${midCounter} kar dijiye, deal pakki samjho!`,
    nextTurn: turnCount + 1
  };
}

/**
 * Intent classifier for Hinglish messages without explicit prices
 * @param {string} message
 * @returns {'BARGAIN'|'AGREE'|'QUERY'|'UNKNOWN'}
 */
function classifyIntent(message) {
  const lower = message.toLowerCase();

  const agreePatterns = ['done', 'theek hai', 'maan gaye', 'send karo', 'bhej do', 'pakka', 'confirm', 'le lunga', 'lelo'];
  const bargainPatterns = ['kam karo', 'discount', 'sasta', 'uccha hai', 'mehnga', 'kam lagao', 'kuch toh karo', 'bhaiya', 'yaar'];
  const queryPatterns = ['kya', 'kaisa', 'detail', 'specification', 'color', 'size', 'stock', 'available'];

  if (agreePatterns.some(p => lower.includes(p))) return 'AGREE';
  if (bargainPatterns.some(p => lower.includes(p))) return 'BARGAIN';
  if (queryPatterns.some(p => lower.includes(p))) return 'QUERY';
  return 'UNKNOWN';
}

module.exports = { handleIndianBargain, classifyIntent };
