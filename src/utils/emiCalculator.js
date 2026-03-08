// ============================================================
// Vyapaar-AI | src/utils/emiCalculator.js
// MODULE 2: EMI & Loan Calculator Engine
// Use Case: Customer ko EMI batao, deal close karo turant
// Feature: EMI, total interest, affordability check, loan compare
// ============================================================

'use strict';

/**
 * Calculate Monthly EMI using standard formula
 * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * @param {number} principal - Loan amount (INR)
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} tenureMonths - Loan tenure in months
 * @returns {Object} EMI breakdown
 */
function calculateEMI(principal, annualRate, tenureMonths) {
  if (!principal || principal <= 0) throw new Error('Invalid principal amount');
  if (!annualRate || annualRate <= 0) throw new Error('Invalid interest rate');
  if (!tenureMonths || tenureMonths <= 0) throw new Error('Invalid tenure');

  const monthlyRate = annualRate / (12 * 100);
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)
              / (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;
  const interestPercentage = ((totalInterest / principal) * 100).toFixed(2);

  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principal,
    annualRate,
    tenureMonths,
    interestPercentage: parseFloat(interestPercentage),
    monthlyRate: (monthlyRate * 100).toFixed(4)
  };
}

/**
 * Generate full EMI schedule (amortization table)
 * @param {number} principal
 * @param {number} annualRate
 * @param {number} tenureMonths
 * @returns {Array} Month-by-month breakdown
 */
function generateEMISchedule(principal, annualRate, tenureMonths) {
  const { emi } = calculateEMI(principal, annualRate, tenureMonths);
  const monthlyRate = annualRate / (12 * 100);
  let balance = principal;
  const schedule = [];

  for (let month = 1; month <= tenureMonths; month++) {
    const interestPaid = Math.round(balance * monthlyRate);
    const principalPaid = Math.round(emi - interestPaid);
    balance = Math.max(0, Math.round(balance - principalPaid));

    schedule.push({
      month,
      emi: Math.round(emi),
      principalPaid,
      interestPaid,
      balance
    });
  }
  return schedule;
}

/**
 * Compare multiple loan options side by side
 * @param {number} principal
 * @param {Array<{label, rate, tenure}>} options
 * @returns {Array} Sorted by lowest total cost
 */
function compareLoanOptions(principal, options) {
  return options
    .map(opt => ({
      ...opt,
      ...calculateEMI(principal, opt.rate, opt.tenure)
    }))
    .sort((a, b) => a.totalPayment - b.totalPayment);
}

/**
 * Affordability Check - Can customer afford this EMI?
 * @param {number} monthlyIncome
 * @param {number} emi
 * @param {number} existingEMIs - Already paying EMIs
 * @returns {Object} Affordability result
 */
function checkAffordability(monthlyIncome, emi, existingEMIs = 0) {
  const totalEMI = emi + existingEMIs;
  const emiToIncomeRatio = (totalEMI / monthlyIncome * 100).toFixed(1);
  const recommended = monthlyIncome * 0.4; // 40% rule
  const affordable = totalEMI <= recommended;

  let status, advice;
  if (emiToIncomeRatio <= 30) {
    status = 'EXCELLENT';
    advice = 'Bilkul le sakte ho! EMI income ka 30% se kam hai. Financially safe hai.';
  } else if (emiToIncomeRatio <= 40) {
    status = 'GOOD';
    advice = 'Theek hai. EMI manageable hai. Koi emergency fund zaroor rakho.';
  } else if (emiToIncomeRatio <= 50) {
    status = 'RISKY';
    advice = 'Thoda risky hai. Tenure badhao ya down payment badhao.';
  } else {
    status = 'DANGER';
    advice = 'Mat lo abhi. Income ka 50%+ EMI mein ja raha hai. Financial stress hoga.';
  }

  return {
    affordable,
    status,
    emiToIncomeRatio: parseFloat(emiToIncomeRatio),
    advice,
    maxRecommendedEMI: Math.round(recommended - existingEMIs)
  };
}

/**
 * Format EMI result for Telegram/WhatsApp message
 * @param {Object} result - calculateEMI output
 * @returns {string}
 */
function formatEMIMessage(result) {
  return `EMI Calculation Result:

Loan Amount: Rs.${result.principal.toLocaleString('en-IN')}
Interest Rate: ${result.annualRate}% per year
Tenure: ${result.tenureMonths} months (${(result.tenureMonths/12).toFixed(1)} years)

Monthly EMI: Rs.${result.emi.toLocaleString('en-IN')}
Total Amount: Rs.${result.totalPayment.toLocaleString('en-IN')}
Total Interest: Rs.${result.totalInterest.toLocaleString('en-IN')} (${result.interestPercentage}% extra)

Tip: Down payment zyada do toh interest bachega!`;
}

/**
 * Common Indian loan presets
 * Ready-to-use configs for mobile, bike, home, personal loans
 */
const LOAN_PRESETS = {
  MOBILE_PHONE: { rate: 18, tenure: 12, label: 'Mobile Phone EMI' },
  TWO_WHEELER: { rate: 12, tenure: 24, label: 'Bike/Scooter Loan' },
  PERSONAL_LOAN: { rate: 14, tenure: 36, label: 'Personal Loan' },
  HOME_LOAN: { rate: 8.5, tenure: 240, label: 'Home Loan (20yr)' },
  BUSINESS_LOAN: { rate: 16, tenure: 60, label: 'Business Loan' },
  GOLD_LOAN: { rate: 9, tenure: 12, label: 'Gold Loan' }
};

module.exports = {
  calculateEMI,
  generateEMISchedule,
  compareLoanOptions,
  checkAffordability,
  formatEMIMessage,
  LOAN_PRESETS
};
