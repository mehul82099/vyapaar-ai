// ============================================================
// Vyapaar-AI | src/tools/fakeNewsDetector.js
// MODULE 4: FAKE NEWS & WHATSAPP FORWARD DETECTOR
// Kya karta hai: Koi bhi news/forward paste karo - sach ya jhooth batao
// Kise chahiye: Sabko - India mein fake news ki badi problem hai
// Cost: ZERO RUPEES
// ============================================================

'use strict';

/**
 * Red flag patterns jo fake news mein common hain
 * Researchers ne study karke ye patterns nikale hain
 */
const FAKE_NEWS_RED_FLAGS = [
  // Urgency & Fear tactics
  { pattern: /turant share karo|abhi share karo|5 minute mein|aaj raat tak/i,   score: 25, reason: 'Urgency pressure - asli news mein aisa nahi hota' },
  { pattern: /viral karo|forward karo|sabko bhejo|10 logon ko bhejo/i,          score: 30, reason: 'Chain forward request - classic fake news technique' },
  { pattern: /government ne chhupaaya|media nahi batayega|sach saamne aaya/i,   score: 35, reason: 'Conspiracy language - unverified claim' },
  { pattern: /100% sach|bilkul sach|confirmed news|breaking news/i,             score: 20, reason: 'Over-confidence - asli journalist aisa nahi kehta' },
  { pattern: /free mein mil raha|lottery|ek crore|prize jeet liya/i,            score: 40, reason: 'Too good to be true - scam pattern' },
  { pattern: /whatsapp pe aaya|kisi ne bheja|mujhe mila|viral ho raha/i,         score: 25, reason: 'Source nahi bataya - unverified origin' },
  { pattern: /modi ne kaha|pm ne kaha|cm ne kaha/i,                             score: 20, reason: 'Political claim - verify karo official site pe' },
  { pattern: /doctors nahi chahte|pharma company chupaati|miracle cure/i,       score: 45, reason: 'Medical misinformation pattern - dangerous' },
  { pattern: /note band hoga|currency change|rbi ne kaha/i,                     score: 35, reason: 'Financial panic - check rbi.org.in' },
  { pattern: /train accident|bomb blast|attack hua/i,                           score: 15, reason: 'Breaking news claim - verify on news sites' }
];

/**
 * Credibility indicators - good signs
 */
const CREDIBILITY_SIGNS = [
  { pattern: /ndtv|aajtak|times of india|hindustan times|bbc|pti|ani/i, score: -20, reason: 'Known news source mentioned' },
  { pattern: /according to|source:|official statement|press release/i,  score: -15, reason: 'Source cited' },
  { pattern: /https?:\/\//i,                                             score: -10, reason: 'Link provided for verification' }
];

/**
 * Main function: Analyze text for fake news signals
 * @param {string} text - News/forward text to analyze
 * @returns {Object} Analysis result
 */
function analyzeFakeNews(text) {
  if (!text || text.trim().length < 20) {
    return { error: 'Text bahut chhota hai. Poora message paste karo.' };
  }

  let riskScore = 0;
  const redFlagsFound = [];
  const goodSignsFound = [];

  // Check red flags
  for (const flag of FAKE_NEWS_RED_FLAGS) {
    if (flag.pattern.test(text)) {
      riskScore += flag.score;
      redFlagsFound.push(flag.reason);
    }
  }

  // Check credibility signs
  for (const sign of CREDIBILITY_SIGNS) {
    if (sign.pattern.test(text)) {
      riskScore += sign.score;
      goodSignsFound.push(sign.reason);
    }
  }

  // Cap score
  riskScore = Math.max(0, Math.min(100, riskScore));

  // Verdict
  let verdict, emoji, advice;
  if (riskScore >= 70) {
    verdict = 'FAKE / MISLEADING hone ki bahut zyada sambhavna';
    emoji = 'DANGER';
    advice = 'Bilkul forward mat karo! Pehle PIB Fact Check website pe verify karo.';
  } else if (riskScore >= 40) {
    verdict = 'SUSPICIOUS - Verify karna zaroori hai';
    emoji = 'WARNING';
    advice = 'Seedha trust mat karo. Google pe headline search karo.';
  } else if (riskScore >= 20) {
    verdict = 'THODA DOUBT HAI - Check karo';
    emoji = 'CAUTION';
    advice = 'Official source se confirm karo. Phir share karo.';
  } else {
    verdict = 'RELATIVELY SAFE lagta hai';
    emoji = 'OK';
    advice = 'Fir bhi ek baar source check karna achha hai.';
  }

  return {
    riskScore,
    verdict,
    emoji,
    advice,
    redFlagsFound,
    goodSignsFound,
    verifyLinks: [
      'PIB Fact Check: pib.gov.in/factcheck',
      'Google: news.google.com',
      'India Today Fact Check: indiatoday.in/fact-check'
    ]
  };
}

/**
 * Format result for Telegram/WhatsApp
 * @param {Object} result
 * @returns {string}
 */
function formatFakeNewsReport(text) {
  const result = analyzeFakeNews(text);
  if (result.error) return result.error;

  const bars = Math.round(result.riskScore / 10);
  const meter = '[' + '#'.repeat(bars) + '-'.repeat(10 - bars) + ']';

  let report = `FAKE NEWS DETECTOR REPORT\n\n`;
  report += `Risk Score: ${result.riskScore}/100\n${meter}\n\n`;
  report += `VERDICT: ${result.verdict}\n\n`;

  if (result.redFlagsFound.length > 0) {
    report += `RED FLAGS:\n`;
    result.redFlagsFound.forEach(f => { report += `  x ${f}\n`; });
    report += '\n';
  }

  if (result.goodSignsFound.length > 0) {
    report += `ACHHE SIGNS:\n`;
    result.goodSignsFound.forEach(f => { report += `  ok ${f}\n`; });
    report += '\n';
  }

  report += `KARNA KYA HAI: ${result.advice}\n\n`;
  report += `VERIFY KARO:\n`;
  result.verifyLinks.forEach(l => { report += `  - ${l}\n`; });

  return report;
}

module.exports = { analyzeFakeNews, formatFakeNewsReport };
