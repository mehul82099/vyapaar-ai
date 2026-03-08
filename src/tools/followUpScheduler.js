/**
 * MODULE 10: AI Customer Follow-up Scheduler
 * ============================================
 * Chhote shopkeepers ke liye customer follow-up automation
 * Auto WhatsApp messages, payment reminders, order updates
 * 
 * Features:
 * - Customer follow-up templates (Hinglish)
 * - Payment reminder messages
 * - Order status updates
 * - Festival greeting automation
 * - Re-engagement messages for inactive customers
 * - n8n integration compatible
 */

// Follow-up types
const FOLLOWUP_TYPES = {
  PAYMENT_REMINDER: 'payment_reminder',
  ORDER_UPDATE: 'order_update',
  FIRST_FOLLOWUP: 'first_followup',
  REPEAT_CUSTOMER: 'repeat_customer',
  INACTIVE_CUSTOMER: 'inactive_customer',
  FESTIVAL_GREETING: 'festival_greeting',
  COMPLAINT_FOLLOWUP: 'complaint_followup',
  QUOTE_FOLLOWUP: 'quote_followup'
};

// Pre-written Hinglish message templates
const MESSAGE_TEMPLATES = {
  [FOLLOWUP_TYPES.PAYMENT_REMINDER]: [
    `Namaste {{customerName}} ji! 🙏

Hum {{shopName}} se bol rahe hain.

Aapke paas Rs.{{amount}} ki pending payment hai jo {{dueDate}} tak due hai.

Please jaldi clear kar dein! 🙏

Koi problem ho toh bataiye, hum samadhan nikalenge.

Dhanyawad! 😊`,
    `Hello {{customerName}} ji!

Yaad dilana chahte hain ki aapka {{amount}} rupaye ka baki abhi bhi pending hai.

Kya aap ise {{dueDate}} tak transfer kar sakte hain?

UPI: {{upiId}}

Shukriya! 🙏`
  ],
  
  [FOLLOWUP_TYPES.ORDER_UPDATE]: [
    `📦 Order Update - {{shopName}}

Hello {{customerName}} ji!

Aapka order #{{orderId}} ka update:

✅ Status: {{status}}
📍 Delivery: {{deliveryInfo}}

Koi sawaal ho toh {{shopPhone}} pe call karein.

Dhanyawad! 😊`,
  ],
  
  [FOLLOWUP_TYPES.FIRST_FOLLOWUP]: [
    `Namaste {{customerName}} ji! 🙏

{{shopName}} mein aapka swagat hai!

Aaj aapne hamse shopping ki, bahut bahut shukriya!

Aage bhi seva ka mauka dein. Koi bhi zaroorat ho toh:
📞 {{shopPhone}}

Happy shopping! 😊`
  ],
  
  [FOLLOWUP_TYPES.REPEAT_CUSTOMER]: [
    `Namaste {{customerName}} ji! 🙏

Aap hamare valued customer hain!

Aapke liye special offer: Agli purchase par {{discountPercent}}% discount.

Code: {{couponCode}}

Valid till: {{validTill}}

{{shopName}} ke saath shopping ka mazaa lein! 🛒`
  ],
  
  [FOLLOWUP_TYPES.INACTIVE_CUSTOMER]: [
    `Namaste {{customerName}} ji!

Kafi time ho gaya aapko yaad nahi aaye 😢

Kya sab theek hai? Koi baat ho toh zaroor batayein.

Hamare naye products aaye hain jo aapko pasand aa sakte hain:
🔗 {{catalogLink}}

{{shopName}} mein aapka intezaar hai! 🙏`
  ],
  
  [FOLLOWUP_TYPES.FESTIVAL_GREETING]: [
    `🎉 {{festivalName}} ki Hardik Shubhkamnayein! 🎉

Priya {{customerName}} ji,

{{shopName}} ki taraf se aapko aur aapke poore parivar ko {{festivalName}} ki bahut bahut badhaai!

Is khushiyon ke mauke par special offers:
{{offerDetails}}

Khushi ho tyohar! 😄`
  ],
  
  [FOLLOWUP_TYPES.COMPLAINT_FOLLOWUP]: [
    `Namaste {{customerName}} ji,

Aapki complaint ke baare mein maafi maangte hain.

Aapki problem: {{complaintDetails}}

Hamne yeh steps liye hain:
{{resolutionSteps}}

Aasha hai aap santusht hain. Aage bhi seva ka mauka dein.

Dhanyawad! {{shopName}} Team`
  ],
  
  [FOLLOWUP_TYPES.QUOTE_FOLLOWUP]: [
    `Namaste {{customerName}} ji!

Humne aapko {{quoteDate}} ko {{productName}} ka quote bheja tha (Rs.{{quoteAmount}}).

Kya aap interested hain? Koi sawal ho toh batayein.

Yeh offer {{validTill}} tak valid hai.

Call/WhatsApp: {{shopPhone}}

{{shopName}} - Hamesha aapki seva mein! 🙏`
  ]
};

// Template fill karo customer data se
function fillTemplate(template, data) {
  let filled = template;
  
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    filled = filled.replace(new RegExp(placeholder, 'g'), value || '');
  });
  
  return filled;
}

// Best message choose karo
function generateFollowUpMessage(type, customerData) {
  const templates = MESSAGE_TEMPLATES[type];
  if (!templates || templates.length === 0) {
    return 'Invalid followup type';
  }
  
  // Random template choose karo (variation ke liye)
  const template = templates[Math.floor(Math.random() * templates.length)];
  return fillTemplate(template, customerData);
}

// Next follow-up date calculate karo
function calculateNextFollowUp(lastContactDate, followUpType) {
  const date = new Date(lastContactDate);
  
  const intervals = {
    [FOLLOWUP_TYPES.PAYMENT_REMINDER]: 3,     // 3 din baad
    [FOLLOWUP_TYPES.QUOTE_FOLLOWUP]: 2,        // 2 din baad
    [FOLLOWUP_TYPES.FIRST_FOLLOWUP]: 7,        // 1 hafte baad
    [FOLLOWUP_TYPES.INACTIVE_CUSTOMER]: 30,    // 1 mahine baad
    [FOLLOWUP_TYPES.REPEAT_CUSTOMER]: 14       // 2 hafte baad
  };
  
  const daysToAdd = intervals[followUpType] || 7;
  date.setDate(date.getDate() + daysToAdd);
  
  return {
    nextDate: date.toLocaleDateString('en-IN'),
    daysFromNow: daysToAdd,
    message: `${daysToAdd} din baad contact karo - ${date.toLocaleDateString('en-IN')}`
  };
}

// Customer list se bulk messages generate karo
function bulkFollowUpMessages(customers, followUpType, shopInfo) {
  return customers.map(customer => {
    const data = { ...shopInfo, ...customer };
    const message = generateFollowUpMessage(followUpType, data);
    const nextFollowUp = calculateNextFollowUp(new Date(), followUpType);
    
    return {
      customerName: customer.customerName,
      phone: customer.phone,
      message,
      nextFollowUp: nextFollowUp.nextDate,
      priority: customer.amount > 10000 ? 'HIGH' : 'NORMAL'
    };
  });
}

// Upcoming festivals list
function getUpcomingFestivals() {
  const today = new Date();
  const month = today.getMonth() + 1;
  
  const festivals = [
    { name: 'Makar Sankranti', month: 1, day: 14 },
    { name: 'Holi', month: 3, day: 25 },
    { name: 'Eid ul-Fitr', month: 4, day: 10 },
    { name: 'Navratri', month: 10, day: 3 },
    { name: 'Dussehra', month: 10, day: 12 },
    { name: 'Diwali', month: 10, day: 20 },
    { name: 'Christmas', month: 12, day: 25 },
    { name: 'New Year', month: 1, day: 1 }
  ];
  
  // Next 30 days mein aane wale festivals
  return festivals.filter(f => {
    const fDate = new Date(today.getFullYear(), f.month - 1, f.day);
    const diff = (fDate - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });
}

// n8n workflow ke liye formatted output
function formatForN8N(messages) {
  return messages.map(msg => ({
    to: msg.phone,
    text: msg.message,
    metadata: {
      customerName: msg.customerName,
      priority: msg.priority,
      nextFollowUp: msg.nextFollowUp,
      timestamp: new Date().toISOString()
    }
  }));
}

// Daily digest - aaj kya karna hai
function getDailyFollowUpDigest(followUpList) {
  const today = new Date().toLocaleDateString('en-IN');
  const todayItems = followUpList.filter(item => item.dueDate === today);
  const overdueItems = followUpList.filter(item => {
    return new Date(item.dueDate) < new Date() && item.status !== 'done';
  });
  
  let digest = `📊 *AAJ KA FOLLOW-UP DIGEST*\n\n`;
  digest += `📅 Date: ${today}\n\n`;
  
  if (overdueItems.length > 0) {
    digest += `🔴 *Overdue (${overdueItems.length} customers):*\n`;
    overdueItems.slice(0, 5).forEach(item => {
      digest += `- ${item.customerName}: ${item.reason}\n`;
    });
    digest += `\n`;
  }
  
  if (todayItems.length > 0) {
    digest += `🟡 *Aaj karo (${todayItems.length} customers):*\n`;
    todayItems.slice(0, 10).forEach(item => {
      digest += `- ${item.customerName}: ${item.reason} (${item.priority})\n`;
    });
  } else {
    digest += `✅ Aaj koi pending follow-up nahi!`;
  }
  
  return digest;
}

module.exports = {
  FOLLOWUP_TYPES,
  MESSAGE_TEMPLATES,
  fillTemplate,
  generateFollowUpMessage,
  calculateNextFollowUp,
  bulkFollowUpMessages,
  getUpcomingFestivals,
  formatForN8N,
  getDailyFollowUpDigest
};
