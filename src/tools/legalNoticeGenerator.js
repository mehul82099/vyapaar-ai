/**
 * MODULE 6: Free Legal Notice Generator
 * ====================================
 * Indian context ka simple legal notice generator
 * Chhote disputes ke liye professional-style notice banana
 * 
 * Use case:
 * - Payment recovery notices
 * - Rent disputes
 * - Product refund demands
 * - Service complaint notices
 * - Employment issues
 * 
 * Free hai, koi lawyer fees nahi!
 */

const NOTICE_TYPES = {
  PAYMENT: 'payment',
  RENT: 'rent',
  REFUND: 'refund',
  SERVICE: 'service',
  EMPLOYMENT: 'employment',
  GENERAL: 'general'
};

const NOTICE_QUESTIONS = [
  { id: 'senderName', question: 'Aapka poora naam kya hai?', hint: 'e.g., Ramesh Kumar' },
  { id: 'senderAddress', question: 'Aapka address kya hai?', hint: 'e.g., 123, MG Road, Mumbai' },
  { id: 'recipientName', question: 'Notice kisko bhejni hai? (unka naam)', hint: 'e.g., Suresh Sharma' },
  { id: 'recipientAddress', question: 'Unka address kya hai?', hint: 'e.g., 456, Park Street, Delhi' },
  { id: 'noticeType', question: 'Notice kis type ki hai?\n1. Payment recovery\n2. Rent dispute\n3. Refund demand\n4. Service complaint\n5. Employment issue\n6. General', hint: 'Type: 1-6' },
  { id: 'amount', question: 'Kitne rupaye ka matter hai? (optional, agar applicable ho)', hint: 'e.g., 50000' },
  { id: 'issueDetails', question: 'Kya problem hai? Detail mein batao', hint: 'e.g., Payment nahi mila 3 mahine se' },
  { id: 'date', question: 'Problem kab hui thi? (date)', hint: 'e.g., 15 Jan 2025' },
  { id: 'daysToRespond', question: 'Kitne din ka time dena hai respond karne ke liye?', hint: 'e.g., 15' }
];

function getNoticeTypeFromInput(input) {
  const num = parseInt(input);
  switch(num) {
    case 1: return NOTICE_TYPES.PAYMENT;
    case 2: return NOTICE_TYPES.RENT;
    case 3: return NOTICE_TYPES.REFUND;
    case 4: return NOTICE_TYPES.SERVICE;
    case 5: return NOTICE_TYPES.EMPLOYMENT;
    default: return NOTICE_TYPES.GENERAL;
  }
}

function generateLegalNotice(data) {
  const today = new Date().toLocaleDateString('en-IN');
  const noticeType = getNoticeTypeFromInput(data.noticeType || '6');
  const amount = data.amount ? `Rs. ${data.amount}` : 'disputed amount';
  
  let subject = '';
  let content = '';
  
  switch(noticeType) {
    case NOTICE_TYPES.PAYMENT:
      subject = `LEGAL NOTICE FOR RECOVERY OF PAYMENT`;
      content = `This is to bring to your notice that you owe me/us ${amount} as payment for services/goods rendered. Despite repeated requests, you have failed to make the payment since ${data.date}. This constitutes a breach of our agreement.`;
      break;
    case NOTICE_TYPES.RENT:
      subject = `LEGAL NOTICE - RENT DISPUTE`;
      content = `You have been residing at the mentioned property. This notice is to inform you about pending rent dues of ${amount} since ${data.date}. You are hereby required to clear all outstanding dues and/or vacate the premises.`;
      break;
    case NOTICE_TYPES.REFUND:
      subject = `LEGAL NOTICE - REFUND DEMAND`;
      content = `I/We purchased goods/services from you. Due to ${data.issueDetails}, I/we are entitled to a full refund of ${amount}. Despite multiple requests since ${data.date}, you have not processed the refund.`;
      break;
    case NOTICE_TYPES.SERVICE:
      subject = `LEGAL NOTICE - SERVICE COMPLAINT`;
      content = `I/We availed your services. However, ${data.issueDetails}. This is a serious lapse in service quality. The matter has been pending since ${data.date} without resolution.`;
      break;
    case NOTICE_TYPES.EMPLOYMENT:
      subject = `LEGAL NOTICE - EMPLOYMENT MATTER`;
      content = `This notice is regarding ${data.issueDetails}. Since ${data.date}, this matter has remained unresolved despite my attempts to communicate. This is in violation of employment terms.`;
      break;
    default:
      subject = `LEGAL NOTICE`;
      content = `This notice is to inform you about: ${data.issueDetails}. This matter has been pending since ${data.date} and requires immediate attention.`;
  }
  
  const notice = `
LEGAL NOTICE

Date: ${today}

To,
${data.recipientName}
${data.recipientAddress}

From,
${data.senderName}
${data.senderAddress}

Subject: ${subject}

Dear Sir/Madam,

Under instructions from my client, I am serving this Legal Notice upon you for the following:

${content}

You are hereby called upon to:
${amount !== 'disputed amount' ? `1. Pay the outstanding amount of ${amount} immediately\n` : ''}2. Resolve the above-mentioned matter within ${data.daysToRespond || 15} days from receipt of this notice
3. Provide a written response acknowledging the same

Please note that if you fail to comply with this notice within the stipulated time period, my client shall be constrained to initiate appropriate legal proceedings against you, and you shall be liable for all costs, charges, and consequences thereof.

This notice is issued without prejudice to any other rights and remedies available to my client under law.

Regards,
${data.senderName}

---

⚠️ DISCLAIMER:
Yeh ek basic legal notice template hai. Serious legal matters ke liye ek qualified lawyer se consult zaroor karein. Yeh tool sirf initial communication ke liye hai, proper legal advice nahi hai.
  `.trim();
  
  return notice;
}

function formatNoticeForWhatsApp(notice) {
  return `📋 *LEGAL NOTICE GENERATED*\n\n${notice}\n\n💡 *Next Steps:*\n1. Isko print karke proper format mein type karo\n2. Registered post se bhejo (acknowledgment ke liye)\n3. Ek copy courier se bhi bhej sakte ho\n4. SMS/email se bhi inform karo\n\n⚠️ *Important:* Serious cases mein lawyer se consult zaroor karo!`;
}

function handleNoticeFlow(session, userInput) {
  if (!session) {
    session = { step: 0, data: {} };
  }
  
  const currentQ = NOTICE_QUESTIONS[session.step];
  
  if (session.step > 0) {
    const prevQ = NOTICE_QUESTIONS[session.step - 1];
    session.data[prevQ.id] = userInput.trim();
  }
  
  if (session.step >= NOTICE_QUESTIONS.length) {
    const notice = generateLegalNotice(session.data);
    return {
      reply: formatNoticeForWhatsApp(notice),
      session: { step: 0, data: {} },
      isDone: true
    };
  }
  
  session.step++;
  
  return {
    reply: currentQ.question + '\n\n_' + currentQ.hint + '_',
    session,
    isDone: false
  };
}

module.exports = {
  NOTICE_TYPES,
  NOTICE_QUESTIONS,
  generateLegalNotice,
  formatNoticeForWhatsApp,
  handleNoticeFlow
};
