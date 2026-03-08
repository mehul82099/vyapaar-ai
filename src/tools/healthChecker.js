/**
 * MODULE 7: AI Health Symptom Checker
 * ====================================
 * Aam aadmi ke liye free health triage tool
 * Symptoms check karo, emergency vs OPD decide karo
 * 
 * DISCLAIMER: Yeh medical advice nahi hai!
 * Sirf basic guidance ke liye - DOCTOR se milna zaroor hai
 * 
 * Features:
 * - Symptom-based triage (Emergency / OPD / Home Care)
 * - Common Indian diseases covered
 * - Hindi/Hinglish output
 * - Free, no signup needed
 */

// Emergency level definitions
const TRIAGE_LEVELS = {
  EMERGENCY: 'emergency',   // 108 call karo, turant hospital
  OPD: 'opd',              // 24-48 hrs mein doctor ke paas jao
  HOME: 'home'             // Ghar par rest + basic treatment
};

// Symptoms database - Indian context
const SYMPTOM_DATABASE = [
  {
    id: 'chest_pain',
    keywords: ['chest pain', 'seene mein dard', 'chest dard', 'seena', 'heart pain', 'dil dard'],
    triage: TRIAGE_LEVELS.EMERGENCY,
    disease: 'Heart Attack / Angina',
    action: '108 TURANT CALL KARO!',
    advice: 'Aspirin (325mg) do agar available ho. Patient ko litao. Hospital race karo.',
    doNot: 'Patient ko akela mat chodo. Khaana mat do.'
  },
  {
    id: 'breathing',
    keywords: ['sans nahi aa raha', 'breathing problem', 'dam ghutna', 'saans', 'breathless', 'dam'],
    triage: TRIAGE_LEVELS.EMERGENCY,
    disease: 'Breathing Emergency / Asthma Attack',
    action: '108 CALL KARO TURANT!',
    advice: 'Inhaler ho toh use karo. Patient ko seedha baithao. Khirki kholo.',
    doNot: 'Lataao mat. Paani mat do.'
  },
  {
    id: 'stroke',
    keywords: ['haath sunn', 'muh tedha', 'bol nahi pa raha', 'face drooping', 'arm weak', 'confused'],
    triage: TRIAGE_LEVELS.EMERGENCY,
    disease: 'Stroke (Brain Attack)',
    action: '108 CALL KARO ABHI - BRAIN ATTACK FAST CHECK!',
    advice: 'FAST check: Face-Arm-Speech-Time. Ek bhi fail ho toh hospital.',
    doNot: 'Kuch khilaao-pilaao mat. Aspirin bhi nahi.'
  },
  {
    id: 'high_fever',
    keywords: ['tej bukhar', 'high fever', '104', '105', 'bahut bukhar', 'badan tat raha'],
    triage: TRIAGE_LEVELS.EMERGENCY,
    disease: 'High Fever (104°F+)',
    action: 'Agar 3 din se zyada ya 104+ hai toh turant doctor',
    advice: 'Paracetamol do. Kapde utaro. Thanda pani se pochha lagao.',
    doNot: 'Ice directly mat lagao. Aspirin bacchon ko mat do.'
  },
  {
    id: 'dengue',
    keywords: ['dengue', 'platelet', 'haemorrhagic', 'pet mein dard', 'rash bhi', 'joint pain fever'],
    triage: TRIAGE_LEVELS.OPD,
    disease: 'Suspected Dengue',
    action: '24 ghante mein blood test zaroor karwao',
    advice: 'Paracetamol + ORS + Papaya leaf juice helpful. Rest karo.',
    doNot: 'Ibuprofen/Aspirin bilkul nahi - platelet aur girti hai!'
  },
  {
    id: 'malaria',
    keywords: ['malaria', 'kaanpna', 'thandi+bukhar', 'cycle fever', 'mosquito'],
    triage: TRIAGE_LEVELS.OPD,
    disease: 'Suspected Malaria',
    action: '24 ghante mein blood smear test karwao',
    advice: 'Anti-malarial sirf doctor ki prescription se lo. Paracetamol + rest.',
    doNot: 'Self-medication nahi. Chloroquine doctor ke bina nahi.'
  },
  {
    id: 'diarrhea',
    keywords: ['dast', 'loose motion', 'pani jaisa potty', 'diarrhea', 'ulti dast', 'stomach upset'],
    triage: TRIAGE_LEVELS.HOME,
    disease: 'Diarrhea / Gastroenteritis',
    action: 'Agar 2 din se zyada ya blood aaye toh doctor ke paas jao',
    advice: 'ORS baar baar do. BRAT diet (Banana, Rice, Apple, Toast). Dahi helpful.',
    doNot: 'Spicy/oily khaana nahi. Milk avoid karo.'
  },
  {
    id: 'cold_cough',
    keywords: ['sardi', 'khansi', 'cold', 'cough', 'naak beh raha', 'runny nose', 'gala kharab'],
    triage: TRIAGE_LEVELS.HOME,
    disease: 'Common Cold / Upper Respiratory Infection',
    action: 'Agar 1 week se zyada ya bukhar bhi hai toh doctor se milo',
    advice: 'Garam paani + steam. Shahad + adrak. Rest. Vitamin C lo.',
    doNot: 'Antibiotic NAHI - viral infection hai, antibiotic kaam nahi karta!'
  },
  {
    id: 'headache',
    keywords: ['sir dard', 'headache', 'migraine', 'sir mein dard', 'mastishk'],
    triage: TRIAGE_LEVELS.HOME,
    disease: 'Headache / Migraine',
    action: 'Agar achanak bahut tej ho, ya aankhon se dikhna bhand ho toh EMERGENCY',
    advice: 'Paracetamol + dark room mein rest. Thanda kapda maathe par. Paani piyo.',
    doNot: 'Screen mat dekho. Tej roshni se door raho.'
  },
  {
    id: 'diabetes',
    keywords: ['sugar', 'diabetes', 'thirst', 'zyada pyas', 'bar bar peshab', 'sugar low', 'chakkar sugar'],
    triage: TRIAGE_LEVELS.OPD,
    disease: 'Diabetes Symptom / Blood Sugar Issue',
    action: 'Sugar level check karo. Agar 400+ ya 50- toh EMERGENCY',
    advice: 'Low sugar: Glucose/Mitha turant do. High sugar: Doctor ko call karo.',
    doNot: 'Diabetic ko bhooka mat rakho. Insulin self-adjust nahi karo.'
  },
  {
    id: 'bp',
    keywords: ['bp', 'blood pressure', 'bp high', 'bp low', 'chakkar', 'dizziness'],
    triage: TRIAGE_LEVELS.OPD,
    disease: 'Blood Pressure Issue',
    action: 'BP measure karo. 180/120+ ho toh EMERGENCY. 90/60- toh bhi urgent.',
    advice: 'High BP: Namak-free diet, rest. Low BP: ORS + lait jao.',
    doNot: 'BP medication khud adjust nahi karo.'
  },
  {
    id: 'burn',
    keywords: ['jal gaya', 'burn', 'jalana', 'aag', 'chemical burn'],
    triage: TRIAGE_LEVELS.OPD,
    disease: 'Burn Injury',
    action: 'Agar bada area ya face/hands hai toh EMERGENCY',
    advice: '20 minute thanda paani chalao. Saaf kapda dhako.',
    doNot: 'Ghee/toothpaste/oil BILKUL NAHI lagaao! Ice nahi.'
  }
];

function analyzeSymptoms(symptomText) {
  const text = symptomText.toLowerCase();
  const matches = [];
  
  for (const condition of SYMPTOM_DATABASE) {
    const matchedKeywords = condition.keywords.filter(k => text.includes(k));
    if (matchedKeywords.length > 0) {
      matches.push({
        ...condition,
        matchCount: matchedKeywords.length,
        matchedKeywords
      });
    }
  }
  
  matches.sort((a, b) => {
    const triagePriority = { emergency: 3, opd: 2, home: 1 };
    return triagePriority[b.triage] - triagePriority[a.triage];
  });
  
  return matches;
}

function formatHealthReport(symptomText) {
  const matches = analyzeSymptoms(symptomText);
  
  if (matches.length === 0) {
    return `💊 *Health Check Result*\n\nAapke bataye symptoms se koi specific condition match nahi hua.\n\nGeneral advice:\n- Aaram karo\n- Paani zyada piyo\n- Agar problem 2 din mein theek na ho toh doctor se zaroor milo\n\n⚠️ Yeh medical advice nahi hai!`;
  }
  
  const topMatch = matches[0];
  let triageEmoji = '🟡';
  let triageText = 'OPD / Doctor se Milo';
  
  if (topMatch.triage === TRIAGE_LEVELS.EMERGENCY) {
    triageEmoji = '🔴';
    triageText = 'EMERGENCY - Turant Hospital!';
  } else if (topMatch.triage === TRIAGE_LEVELS.HOME) {
    triageEmoji = '🟢';
    triageText = 'Home Care Possible';
  }
  
  let report = `${triageEmoji} *HEALTH CHECK REPORT*\n\n`;
  report += `*Level:* ${triageText}\n`;
  report += `*Possible Condition:* ${topMatch.disease}\n\n`;
  report += `*🚑 Action:* ${topMatch.action}\n\n`;
  report += `*✅ Kya karo:* ${topMatch.advice}\n\n`;
  report += `*❌ Kya mat karo:* ${topMatch.doNot}\n\n`;
  
  if (matches.length > 1) {
    report += `*Other Possible Conditions:*\n`;
    matches.slice(1, 3).forEach(m => {
      report += `- ${m.disease}\n`;
    });
    report += `\n`;
  }
  
  report += `⚠️ *IMPORTANT DISCLAIMER:*\n`;
  report += `Yeh sirf basic guidance hai, MEDICAL ADVICE NAHI hai.\n`;
  report += `Doctor se milna ZAROOR hai!\n`;
  report += `Emergency: Dial *108*`;
  
  return report;
}

function getHomeremedies(condition) {
  const remedies = {
    cold: 'Adrak + Shahad + Nimbu chai. Steam lena. Garam namak paani se gargle.',
    fever: 'Paracetamol. ORS. Thanda pochha. Aam panna ya nimbu paani.',
    diarrhea: 'ORS. Khichdi. Dahi chawal. Kela. Coconut water.',
    headache: 'Lavender oil maathe par. Dark room. Paani piyo. Paracetamol.',
    acidity: 'Thanda doodh. Jeera paani. Saunf. Amla. Chhachh.',
    general: 'Khoob paani piyo. Proper sleep lo. Halka khaana khao.'
  };
  
  return remedies[condition] || remedies.general;
}

module.exports = {
  TRIAGE_LEVELS,
  SYMPTOM_DATABASE,
  analyzeSymptoms,
  formatHealthReport,
  getHomeremedies
};
