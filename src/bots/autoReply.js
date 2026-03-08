// ============================================================
// Vyapaar-AI | src/bots/autoReply.js
// MODULE 1: Smart Auto Reply Bot
// Use Case: Chhote dukandaar jo 24/7 reply nahi kar sakte
// Feature: Hinglish keyword-based intelligent auto responses
// ============================================================

'use strict';

/**
 * Auto Reply Engine
 * Handles common customer queries automatically
 * so the shopkeeper doesn't need to be online 24/7
 */

const AUTO_REPLY_RULES = [
  // --- Price Inquiry ---
  {
    keywords: ['price', 'rate', 'kitna', 'cost', 'daam', 'kitne ka', 'kya rate'],
    category: 'PRICE_INQUIRY',
    reply: (ctx) => `Namaste! 🙏\nHamara ${ctx.product || 'product'} ka rate:\n• MRP: ₹${ctx.mrp || 'N/A'}\n• Best Price: ₹${ctx.bestPrice || 'N/A'}\n\nBulk order pe special discount milta hai! Kitna quantity chahiye? 📦`
  },
  // --- Stock Availability ---
  {
    keywords: ['available', 'stock', 'hai kya', 'milega', 'chahiye', 'stock mein'],
    category: 'STOCK_INQUIRY',
    reply: (ctx) => `Haan ji! ${ctx.product || 'Product'} available hai. ✅\nStock: ${ctx.stock || 'Limited'} pieces baaki hain.\nOrder karna ho toh batao, packing karke ready kar deta hun! 📦`
  },
  // --- Delivery Query ---
  {
    keywords: ['delivery', 'shipping', 'kitne din', 'kab milega', 'courier', 'bhejdo'],
    category: 'DELIVERY_INQUIRY',
    reply: () => `Delivery details:\n🚚 Same City: 1-2 din\n🚚 Other Cities: 3-5 din\n🚚 Express available hai extra charge pe\n\nOrder confirm karne ke baad tracking number diya jayega! 📍`
  },
  // --- Payment Methods ---
  {
    keywords: ['payment', 'upi', 'gpay', 'paytm', 'online', 'transfer', 'cash', 'cod'],
    category: 'PAYMENT_INQUIRY',
    reply: () => `Payment Options:\n✅ UPI (GPay/PhonePe/Paytm)\n✅ Bank Transfer\n✅ Cash on Delivery (local orders)\n✅ EMI available (3-12 months)\n\nKaunsa prefer karoge? 💳`
  },
  // --- Return/Warranty ---
  {
    keywords: ['return', 'warranty', 'guarantee', 'kharab', 'defect', 'replace', 'wapas'],
    category: 'RETURN_INQUIRY',
    reply: () => `Return/Warranty Policy:\n🔄 7 din return policy (unused condition)\n🛡️ 6 months warranty on defects\n📞 Issue aaye toh seedha call karo: contact number pe\n\nHamara koi bhi customer unhappy nahi gaya! 😊`
  },
  // --- Bulk/Wholesale ---
  {
    keywords: ['bulk', 'wholesale', 'thok', 'quantity', 'zyada', 'dealer', 'reseller'],
    category: 'BULK_INQUIRY',
    reply: (ctx) => `Wholesale Inquiry Receive Hua! 🌟\nBulk discount structure:\n• 10-50 pcs: 10% off\n• 51-100 pcs: 15% off\n• 100+ pcs: 20% off + free delivery\n\nKitne pieces chahiye? Main special quote banaata hun aapke liye! 💰`
  },
  // --- Shop timing ---
  {
    keywords: ['timing', 'open', 'band', 'kab', 'time', 'sunday', 'holiday'],
    category: 'TIMING_INQUIRY',
    reply: () => `Shop Timings:\n🕔 Mon-Sat: 10am - 8pm\n🕔 Sunday: 11am - 5pm\n\nOnline order 24/7 available hai! 💻\nAbhi order karo, kal milega! 😊`
  },
  // --- Complaint ---
  {
    keywords: ['complaint', 'problem', 'issue', 'galat', 'wrong', 'cheated', 'dhoka'],
    category: 'COMPLAINT',
    reply: () => `Bhai/Behen, aapki pareshani sun ke dukh hua. 🙏\nHum turant solve karenge:\n1. Problem detail WhatsApp pe bhejo\n2. Photo/video ho toh attach karo\n3. Order ID batao\n\nPromise: 24 hours mein solution milega! 📞`
  }
];

/**
 * Main function: Process incoming customer message
 * @param {string} message - Customer's message text
 * @param {Object} ctx - Context (product, mrp, stock etc)
 * @returns {{ category: string, reply: string, isAutoHandled: boolean }}
 */
function processAutoReply(message, ctx = {}) {
  const lower = message.toLowerCase();

  // Find matching rule
  for (const rule of AUTO_REPLY_RULES) {
    const matched = rule.keywords.some(kw => lower.includes(kw));
    if (matched) {
      return {
        category: rule.category,
        reply: rule.reply(ctx),
        isAutoHandled: true,
        confidence: 'HIGH'
      };
    }
  }

  // No rule matched - escalate to human
  return {
    category: 'UNKNOWN',
    reply: `Namaste! 🙏 Aapka message mila.\nHamara team jald hi reply karega (usually within 30 mins).\nUrgent ho toh call karo! 📞`,
    isAutoHandled: false,
    confidence: 'LOW'
  };
}

/**
 * Greeting detector for new customers
 * @param {string} message
 * @returns {string|null}
 */
function detectGreeting(message) {
  const greetings = ['hi', 'hello', 'hii', 'hey', 'namaste', 'namaskar', 'jai shree ram', 'ram ram', 'salaam', 'adaab'];
  const lower = message.toLowerCase().trim();
  if (greetings.some(g => lower.startsWith(g) || lower === g)) {
    return `👋 Namaste! Vyapaar-AI mein aapka swagat hai!\n\nMain aapki in cheezon mein madad kar sakta hun:\n1️⃣ Product price & availability\n2️⃣ Delivery information\n3️⃣ Payment options\n4️⃣ Return & warranty\n5️⃣ Bulk/wholesale orders\n\nKya poochna hai aapko? 😊`;
  }
  return null;
}

module.exports = { processAutoReply, detectGreeting, AUTO_REPLY_RULES };
