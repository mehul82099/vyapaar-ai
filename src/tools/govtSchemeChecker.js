// ============================================================
// Vyapaar-AI | src/tools/govtSchemeChecker.js
// MODULE 5: GOVERNMENT SCHEME ELIGIBILITY CHECKER
// Kya karta hai: Apni details daalo - kaun si sarkari scheme milegi batao
// Kise chahiye: Garib, kisan, mahila, student, differently abled
// Cost: ZERO - ye information free honi chahiye thi waise bhi
// ============================================================

'use strict';

/**
 * India ki major government schemes database
 * Eligibility rules real government criteria pe based hain
 */
const GOVT_SCHEMES = [
  {
    name: 'PM Ujjwala Yojana',
    description: 'Free LPG gas cylinder connection milta hai',
    howToApply: 'Nazdiki LPG dealer ya CSC center pe jao',
    benefit: 'Free gas connection + subsidy',
    check: (p) => p.gender === 'female' && p.bpl === true && p.hasGas === false
  },
  {
    name: 'PM Kisan Samman Nidhi',
    description: 'Kisano ko Rs.6000 per year direct account mein',
    howToApply: 'pmkisan.gov.in ya CSC center',
    benefit: 'Rs.2000 teen baar per year',
    check: (p) => p.occupation === 'farmer' && p.landOwner === true
  },
  {
    name: 'Ayushman Bharat (PMJAY)',
    description: 'Rs.5 lakh tak free hospital treatment',
    howToApply: 'pmjay.gov.in ya nazdiki hospital',
    benefit: 'Rs.5 lakh health insurance free',
    check: (p) => p.bpl === true || p.annualIncome <= 200000
  },
  {
    name: 'PM Mudra Loan Yojana',
    description: 'Chhota business shuru karne ke liye 50k-10 lakh loan',
    howToApply: 'Nazdiki bank ya mudra.org.in',
    benefit: 'Rs.50,000 to Rs.10 lakh loan at low interest',
    check: (p) => p.occupation === 'self-employed' || p.wantsBusiness === true
  },
  {
    name: 'Sukanya Samriddhi Yojana',
    description: 'Beti ki padhai aur shaadi ke liye saving scheme',
    howToApply: 'Post office ya bank mein account kholo',
    benefit: '8.2% interest + tax benefit',
    check: (p) => p.hasDaughter === true && p.daughterAge <= 10
  },
  {
    name: 'Pradhan Mantri Awas Yojana',
    description: 'Pucca ghar banane ke liye 1.5 lakh subsidy',
    howToApply: 'pmaymis.gov.in ya gram panchayat',
    benefit: 'Rs.1.2 to 1.5 lakh subsidy for house',
    check: (p) => p.bpl === true && p.ownHouse === false
  },
  {
    name: 'National Scholarship Portal',
    description: 'Students ke liye monthly scholarship',
    howToApply: 'scholarships.gov.in',
    benefit: 'Rs.10,000 to Rs.50,000 per year',
    check: (p) => p.isStudent === true && p.annualIncome <= 250000
  },
  {
    name: 'PM Shram Yogi Maandhan',
    description: 'Asangathit kaamgar ko Rs.3000/month pension at 60',
    howToApply: 'CSC center ya maandhan.in',
    benefit: 'Rs.3000/month pension after 60',
    check: (p) => p.occupation === 'labor' && p.age >= 18 && p.age <= 40 && p.annualIncome <= 180000
  },
  {
    name: 'Kisan Credit Card',
    description: 'Kisan ko fasal ke liye aasaan loan 7% interest pe',
    howToApply: 'Nazdiki bank mein KCC form bharo',
    benefit: 'Rs.1.6 lakh without security at 7% interest',
    check: (p) => p.occupation === 'farmer'
  },
  {
    name: 'Stand Up India',
    description: 'Mahila ya SC/ST ko business loan 10 lakh-1 crore',
    howToApply: 'Nazdiki bank ya standupmitra.in',
    benefit: 'Rs.10 lakh to 1 crore business loan',
    check: (p) => (p.gender === 'female' || p.category === 'sc' || p.category === 'st') && p.wantsBusiness === true
  }
];

/**
 * User ki profile ke hisaab se eligible schemes nikalo
 * @param {Object} profile - User details
 * @returns {Array} Matched schemes
 */
function checkEligibility(profile) {
  const matched = [];
  const notMatched = [];

  for (const scheme of GOVT_SCHEMES) {
    try {
      if (scheme.check(profile)) {
        matched.push({ name: scheme.name, description: scheme.description, benefit: scheme.benefit, howToApply: scheme.howToApply });
      } else {
        notMatched.push(scheme.name);
      }
    } catch (e) {
      // Skip if check fails
    }
  }

  return { matched, totalChecked: GOVT_SCHEMES.length, notMatched };
}

/**
 * Format result for Telegram
 * @param {Object} profile
 * @returns {string}
 */
function formatSchemeReport(profile) {
  const { matched, totalChecked } = checkEligibility(profile);

  if (matched.length === 0) {
    return `Aapki details ke hisaab se ${totalChecked} schemes check kiye.\nAbhi koi match nahi mila. Details update karke dobara check karo.`;
  }

  let report = `GOVT SCHEME CHECKER RESULT\n`;
  report += `${matched.length} schemes mein aap ELIGIBLE ho!\n\n`;

  matched.forEach((s, i) => {
    report += `${i + 1}. ${s.name}\n`;
    report += `   Kya milega: ${s.benefit}\n`;
    report += `   Kahan apply karein: ${s.howToApply}\n\n`;
  });

  report += `Yaad rakho: Ye sab FREE government schemes hain.\nKoi agent paise maange toh SCAM hai!`;
  return report;
}

/**
 * Conversation flow - ek ek karke questions poocho
 */
const PROFILE_QUESTIONS = [
  { field: 'age',          question: 'Aapki umar kitni hai? (Number mein)' },
  { field: 'gender',       question: 'Aap male ho ya female? (male/female)' },
  { field: 'occupation',   question: 'Kya kaam karte ho? (farmer/labor/self-employed/job/student)' },
  { field: 'annualIncome', question: 'Saal mein kitna kamata/kamaati ho? (Rupees mein, e.g. 120000)' },
  { field: 'bpl',          question: 'BPL card hai? (haan/nahi)' },
  { field: 'ownHouse',     question: 'Khud ka pucca ghar hai? (haan/nahi)' },
  { field: 'hasDaughter',  question: '10 saal se choti beti hai? (haan/nahi)' }
];

function handleSchemeFlow(session, userInput) {
  if (!session) session = { step: 0, data: {} };

  if (session.step > 0 && userInput) {
    const prevField = PROFILE_QUESTIONS[session.step - 1].field;
    let val = userInput.toLowerCase().trim();
    // Convert to proper types
    if (val === 'haan' || val === 'yes' || val === 'ha') val = true;
    else if (val === 'nahi' || val === 'no') val = false;
    else if (!isNaN(val)) val = parseFloat(val);
    session.data[prevField] = val;
  }

  if (session.step >= PROFILE_QUESTIONS.length) {
    return { reply: formatSchemeReport(session.data), session: null, isDone: true };
  }

  const q = PROFILE_QUESTIONS[session.step];
  const progress = `[${session.step + 1}/${PROFILE_QUESTIONS.length}]`;
  session.step++;
  return { reply: `${progress} ${q.question}`, session, isDone: false };
}

module.exports = { checkEligibility, formatSchemeReport, handleSchemeFlow, GOVT_SCHEMES };
