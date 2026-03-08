/**
 * MODULE 9: Smart Bill Splitter
 * ===============================
 * Dosto ke saath restaurant/trip bill split karna
 * Unequal splits, who paid, UPI request messages
 * 
 * Features:
 * - Equal & unequal splitting
 * - Multiple payers support
 * - UPI payment request messages
 * - Trip expense tracker
 * - Currency: Indian Rupees
 */

function splitBillEqually(totalAmount, people) {
  // Total bill ko barabar baant do
  const perPersonAmount = totalAmount / people.length;
  const splits = {};
  
  people.forEach(person => {
    splits[person] = Math.round(perPersonAmount * 100) / 100;
  });
  
  return {
    totalAmount,
    perPerson: perPersonAmount,
    splits,
    type: 'equal'
  };
}

function splitBillUnequally(totalAmount, personShares) {
  // Alag alag shares ke hisaab se split
  // personShares = [{ name: 'Rahul', share: 2 }, { name: 'Amit', share: 1 }]
  const totalShares = personShares.reduce((sum, p) => sum + p.share, 0);
  const splits = {};
  
  personShares.forEach(person => {
    splits[person.name] = Math.round((totalAmount * person.share / totalShares) * 100) / 100;
  });
  
  return {
    totalAmount,
    splits,
    totalShares,
    type: 'unequal'
  };
}

function calculateWhoOwesWhom(expenses) {
  // Expenses = [{ person: 'Rahul', amount: 500 }, ...]
  // Calculate who paid what and who owes whom
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = totalAmount / expenses.length;
  
  // Net balance (positive = others owe them, negative = they owe others)
  const balances = {};
  expenses.forEach(e => {
    balances[e.person] = (balances[e.person] || 0) + e.amount - perPerson;
  });
  
  // Simplify transactions
  const creditors = Object.entries(balances).filter(([_, b]) => b > 0).sort((a, b) => b[1] - a[1]);
  const debtors = Object.entries(balances).filter(([_, b]) => b < 0).sort((a, b) => a[1] - b[1]);
  
  const transactions = [];
  let i = 0, j = 0;
  
  while (i < creditors.length && j < debtors.length) {
    const [creditor, credit] = creditors[i];
    const [debtor, debt] = debtors[j];
    const amount = Math.min(credit, Math.abs(debt));
    
    if (amount > 0.5) { // Ignore tiny amounts
      transactions.push({
        from: debtor,
        to: creditor,
        amount: Math.round(amount)
      });
    }
    
    creditors[i] = [creditor, credit - amount];
    debtors[j] = [debtor, debt + amount];
    
    if (Math.abs(creditors[i][1]) < 0.5) i++;
    if (Math.abs(debtors[j][1]) < 0.5) j++;
  }
  
  return {
    totalAmount,
    perPerson: Math.round(perPerson),
    balances,
    transactions,
    summary: transactions.map(t => `${t.from} -> ${t.to}: Rs.${t.amount}`)
  };
}

function generateUPIRequests(transactions, upiIds = {}) {
  // UPI request messages generate karo
  return transactions.map(t => {
    const upiId = upiIds[t.to] || `${t.to.toLowerCase()}@upi`;
    return {
      ...t,
      upiLink: `upi://pay?pa=${upiId}&pn=${t.to}&am=${t.amount}&cu=INR&tn=Bill+Split`,
      whatsappMessage: `Hey ${t.from}! 💰 Bill split ke liye Rs.${t.amount} bhejo\n\nUPI: ${upiId}\n\nYa is link pe click karo: upi://pay?pa=${upiId}&am=${t.amount}`
    };
  });
}

function calculateTripExpenses(tripName, expenses) {
  // Trip ke saare expenses track karo
  // expenses = [{ person, category, description, amount }]
  
  const byPerson = {};
  const byCategory = {};
  let totalAmount = 0;
  
  expenses.forEach(exp => {
    // Per person
    if (!byPerson[exp.person]) byPerson[exp.person] = { paid: 0, items: [] };
    byPerson[exp.person].paid += exp.amount;
    byPerson[exp.person].items.push(exp);
    
    // Per category
    if (!byCategory[exp.category]) byCategory[exp.category] = 0;
    byCategory[exp.category] += exp.amount;
    
    totalAmount += exp.amount;
  });
  
  const people = Object.keys(byPerson);
  const perPerson = totalAmount / people.length;
  
  // Who owes whom
  const settlements = calculateWhoOwesWhom(
    people.map(p => ({ person: p, amount: byPerson[p].paid }))
  );
  
  return {
    tripName,
    totalAmount,
    perPerson: Math.round(perPerson),
    byPerson,
    byCategory,
    settlements: settlements.transactions
  };
}

function formatBillSplit(result) {
  let msg = `💰 *BILL SPLIT SUMMARY*\n\n`;
  msg += `💵 *Total Bill:* Rs.${result.totalAmount}\n`;
  
  if (result.type === 'equal') {
    msg += `👥 *Per Person:* Rs.${Math.round(result.perPerson)}\n\n`;
    msg += `*Individual Amounts:*\n`;
    Object.entries(result.splits).forEach(([person, amount]) => {
      msg += `- ${person}: Rs.${Math.round(amount)}\n`;
    });
  } else {
    msg += `\n*Individual Amounts (share-based):*\n`;
    Object.entries(result.splits).forEach(([person, amount]) => {
      msg += `- ${person}: Rs.${Math.round(amount)}\n`;
    });
  }
  
  if (result.transactions && result.transactions.length > 0) {
    msg += `\n🔄 *Settlements (kise kitna dena hai):*\n`;
    result.transactions.forEach(t => {
      msg += `➡️ ${t.from} => ${t.to}: Rs.${t.amount}\n`;
    });
  }
  
  msg += `\n💡 *Tip:* UPI se turant transfer karo - koi jhanjhat nahi!`;
  
  return msg;
}

// Simple chat flow for quick bill split
function handleBillSplitFlow(session, userInput) {
  if (!session) session = { step: 0, data: { people: [], expenses: [] } };
  
  const steps = [
    { ask: 'Kitne log hain? (number batao)', key: 'count' },
    { ask: 'Sabke naam batao (comma se alag karo)\ne.g.: Rahul, Amit, Priya', key: 'names' },
    { ask: 'Total bill kitna hai? (Rs. mein)', key: 'total' },
    { ask: 'Equal split chahiye ya different? (equal/different)', key: 'splitType' }
  ];
  
  if (session.step > 0) {
    const prevKey = steps[session.step - 1].key;
    session.data[prevKey] = userInput.trim();
  }
  
  if (session.step >= steps.length) {
    const names = session.data.names.split(',').map(n => n.trim());
    const total = parseFloat(session.data.total);
    
    let result;
    if (session.data.splitType.toLowerCase() === 'equal') {
      result = splitBillEqually(total, names);
    } else {
      result = splitBillEqually(total, names); // default to equal for simplicity
    }
    
    return {
      reply: formatBillSplit(result),
      session: null,
      isDone: true
    };
  }
  
  const currentStep = steps[session.step];
  session.step++;
  
  return {
    reply: currentStep.ask,
    session,
    isDone: false
  };
}

module.exports = {
  splitBillEqually,
  splitBillUnequally,
  calculateWhoOwesWhom,
  generateUPIRequests,
  calculateTripExpenses,
  formatBillSplit,
  handleBillSplitFlow
};
