// ============================================================
// Vyapaar-AI | src/tools/resumeBuilder.js
// MODULE 3: AI RESUME BUILDER
// Kya karta hai: Seedha questions ke jawab do, pro resume ready
// Kise chahiye: Job dhundhne wala har insaan (free mein)
// ============================================================

'use strict';

/**
 * Resume data collect karne ke liye step-by-step questions
 * User sirf jawab deta hai - baki AI handle karta hai
 */
const RESUME_QUESTIONS = [
  { field: 'name',        question: 'Aapka poora naam kya hai?' },
  { field: 'phone',       question: 'Mobile number? (Employer call karega isi pe)' },
  { field: 'email',       question: 'Email address? (Nahi hai toh "nahi" likho)' },
  { field: 'city',        question: 'Aap kahan rehte ho? (City/District)' },
  { field: 'job_target',  question: 'Kaunsi naukri chahiye? (e.g. "Sales Executive", "Driver", "Helper")' },
  { field: 'education',   question: 'Sabse badi padhai kya ki? (e.g. "10th pass", "BA Complete", "ITI")' },
  { field: 'experience',  question: 'Pehle kahan kaam kiya? (Nahi kiya toh "fresher" likho)' },
  { field: 'skills',      question: 'Kya aata hai tumhe? (e.g. "driving, computer, hindi typing, baat karna")' },
  { field: 'languages',   question: 'Kaun kaun si bhasha aati hai? (e.g. "Hindi, English thodi")' },
  { field: 'salary',      question: 'Kitni salary chahiye? (e.g. "15000", "negotiable")' }
];

/**
 * Resume generate karo collected data se
 * @param {Object} data - User ke jawab
 * @returns {string} Ready-to-use resume text
 */
function generateResume(data) {
  const skills = data.skills ? data.skills.split(',').map(s => `  • ${s.trim()}`).join('\n') : '  • Available on request';
  const langs  = data.languages || 'Hindi';

  return `
=====================================
          RESUME / BIO-DATA
=====================================

Naam    : ${data.name || 'N/A'}
Mobile  : ${data.phone || 'N/A'}
Email   : ${data.email !== 'nahi' ? (data.email || 'N/A') : 'N/A'}
Address : ${data.city || 'N/A'}

-------------------------------------
OBJECTIVE
-------------------------------------
Mujhe ${data.job_target || 'suitable position'} ke liye kaam karna hai jahan
main apni skills use karke company grow karne mein madad kar sakun.

-------------------------------------
EDUCATION
-------------------------------------
  ${data.education || 'N/A'}

-------------------------------------
WORK EXPERIENCE
-------------------------------------
  ${data.experience || 'Fresher - Ready to learn and work hard'}

-------------------------------------
SKILLS
-------------------------------------
${skills}

-------------------------------------
LANGUAGES
-------------------------------------
  ${langs}

-------------------------------------
SALARY EXPECTATION
-------------------------------------
  Rs. ${data.salary || 'As per company norms'} per month

=====================================
Main sahi mayne mein kaam karna chahta/chahti hun.
Reference on request.
=====================================
`;
}

/**
 * Cover letter generate karo (Simple Hinglish)
 * @param {Object} data
 * @returns {string}
 */
function generateCoverLetter(data) {
  return `
Date: ${new Date().toLocaleDateString('en-IN')}

Vishay: ${data.job_target || 'Job Application'} ke liye aavedan

Seva mein,
HR Manager,
[Company Ka Naam]

Mahashay/Mahashaya,

Main ${data.name} hun, ${data.city} se. Maine ${data.education} ki
padhai complete ki hai. Mujhe ${data.job_target} ki position ke liye
aavedan karna hai.

Mujhe ${data.skills || 'kaam karne ka'} ka experience hai. Main ek
mehnat kash insaan hun aur sikhne ke liye hamesha taiyaar hun.

Meri salary expectation Rs. ${data.salary || 'negotiable'} per month hai.

Aasha karta/karti hun ki aap mujhe ek interview ka mauka dengey.

Dhanyawad,
${data.name}
Mob: ${data.phone}
`;
}

/**
 * WhatsApp/Telegram conversation flow manage karo
 * @param {Object} session - { step, data }
 * @param {string} userInput
 * @returns {{ reply, session, isDone }}
 */
function handleResumeFlow(session, userInput) {
  if (!session) session = { step: 0, data: {} };

  const q = RESUME_QUESTIONS[session.step];

  // Save previous answer
  if (session.step > 0 && userInput) {
    const prevField = RESUME_QUESTIONS[session.step - 1].field;
    session.data[prevField] = userInput.trim();
  }

  // All questions done?
  if (session.step >= RESUME_QUESTIONS.length) {
    const resume = generateResume(session.data);
    const letter = generateCoverLetter(session.data);
    return {
      reply: `Resume ready hai! Copy karke kisi bhi dukaan pe print karo (Rs.2 mein):\n\n${resume}\n\n--- COVER LETTER ---\n${letter}`,
      session: null,
      isDone: true
    };
  }

  // Ask next question
  const progress = `[${session.step + 1}/${RESUME_QUESTIONS.length}]`;
  session.step++;

  return {
    reply: `${progress} ${q.question}`,
    session,
    isDone: false
  };
}

module.exports = { handleResumeFlow, generateResume, generateCoverLetter, RESUME_QUESTIONS };
