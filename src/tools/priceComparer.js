/**
 * MODULE 8: Smart Price Comparer & Best Deal Finder
 * ==================================================
 * Indian online shopping ke liye best price tracker
 * Amazon, Flipkart, Meesho, Snapdeal compare karo
 * 
 * Features:
 * - Price history analysis
 * - Platform comparison (links generate)
 * - Best time to buy indicator
 * - Cashback + discount calculation
 * - Budget vs premium comparison
 * 
 * Note: Real-time prices ke liye RapidAPI ka free tier use hota hai
 * Yeh module search URLs aur estimate generate karta hai
 */

// Indian e-commerce platforms
const PLATFORMS = {
  AMAZON: {
    name: 'Amazon India',
    emoji: '📦',
    searchUrl: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
    couponTip: 'SBI/HDFC card pe extra 5-10% off milta hai'
  },
  FLIPKART: {
    name: 'Flipkart',
    emoji: '📘',
    searchUrl: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
    couponTip: 'Axis Bank card pe 5% cashback'
  },
  MEESHO: {
    name: 'Meesho',
    emoji: '🛒',
    searchUrl: (q) => `https://www.meesho.com/search?q=${encodeURIComponent(q)}`,
    couponTip: 'Sasta option - manufacturer se direct'
  },
  SNAPDEAL: {
    name: 'Snapdeal',
    emoji: '💰',
    searchUrl: (q) => `https://www.snapdeal.com/search?keyword=${encodeURIComponent(q)}`,
    couponTip: 'SD Cash wallet se extra discount'
  },
  JIOMART: {
    name: 'JioMart',
    emoji: '🛑',
    searchUrl: (q) => `https://www.jiomart.com/search/${encodeURIComponent(q)}`,
    couponTip: 'Jio SIM users ko special offers'
  },
  MYNTRA: {
    name: 'Myntra',
    emoji: '👗',
    searchUrl: (q) => `https://www.myntra.com/${encodeURIComponent(q)}`,
    couponTip: 'Fashion items mein 40-80% sale milti hai'
  }
};

// Category-wise best platform mapping
const CATEGORY_TIPS = {
  electronics: {
    bestPlatform: 'Amazon / Flipkart',
    tip: 'Electronics mein Amazon & Flipkart best hai. Sale events: Big Billion Day, Great Indian Festival.',
    bestTime: 'October-November (Diwali sale) aur January (Republic Day sale)',
    avgDiscount: '20-40%'
  },
  fashion: {
    bestPlatform: 'Myntra / Meesho',
    tip: 'Kapde ke liye Myntra ya Meesho. End of Season Sale mein 50-80% off.',
    bestTime: 'January aur June-July (EOSS)',
    avgDiscount: '40-70%'
  },
  groceries: {
    bestPlatform: 'JioMart / BigBasket',
    tip: 'Grocery ke liye JioMart ya BigBasket. Weekly deals + cashback.',
    bestTime: 'Weekday morning mein fresh stock',
    avgDiscount: '10-20%'
  },
  furniture: {
    bestPlatform: 'Flipkart / Amazon',
    tip: 'Furniture mein Flipkart Big Billion Day best deals.',
    bestTime: 'October-November',
    avgDiscount: '30-50%'
  },
  mobile: {
    bestPlatform: 'Amazon / Flipkart',
    tip: 'Mobile launches pe Amazon exclusive ya Flipkart exclusive hoti hai. Compare dono.',
    bestTime: 'Launch week mein best deals. Sale events mein extra off.',
    avgDiscount: '5-15%'
  },
  general: {
    bestPlatform: 'Amazon / Flipkart',
    tip: 'Dono pe check karo. CamelCamelCamel se Amazon price history dekho.',
    bestTime: 'Sale events ka wait karo',
    avgDiscount: '15-30%'
  }
};

// Price comparison links generate karo
function generateComparisonLinks(productName) {
  const links = {};
  
  for (const [key, platform] of Object.entries(PLATFORMS)) {
    links[key] = {
      name: platform.name,
      emoji: platform.emoji,
      url: platform.searchUrl(productName),
      couponTip: platform.couponTip
    };
  }
  
  return links;
}

// Category detect karo product name se
function detectCategory(productName) {
  const name = productName.toLowerCase();
  
  if (name.match(/phone|mobile|laptop|tablet|earphone|tv|camera|charger|headphone/)) return 'electronics';
  if (name.match(/shirt|pant|dress|saree|jeans|kurta|shoes|chappal|jacket/)) return 'fashion';
  if (name.match(/mobile|samsung|apple|iphone|oneplus|realme|xiaomi|oppo|vivo/)) return 'mobile';
  if (name.match(/atta|dal|rice|oil|sugar|masala|sabzi|grocery/)) return 'groceries';
  if (name.match(/sofa|chair|table|bed|almirah|shelf/)) return 'furniture';
  
  return 'general';
}

// Smart savings calculator
function calculateSavings(originalPrice, salePrice, cashbackPercent = 0) {
  const discount = originalPrice - salePrice;
  const discountPercent = ((discount / originalPrice) * 100).toFixed(1);
  const cashbackAmount = Math.round((salePrice * cashbackPercent) / 100);
  const effectivePrice = salePrice - cashbackAmount;
  const totalSavings = originalPrice - effectivePrice;
  const totalSavingPercent = ((totalSavings / originalPrice) * 100).toFixed(1);
  
  return {
    originalPrice,
    salePrice,
    discount,
    discountPercent,
    cashbackAmount,
    effectivePrice,
    totalSavings,
    totalSavingPercent
  };
}

// Format comparison report
function formatPriceReport(productName) {
  const links = generateComparisonLinks(productName);
  const category = detectCategory(productName);
  const tips = CATEGORY_TIPS[category];
  
  let report = `🛒 *PRICE COMPARISON - ${productName.toUpperCase()}*\n\n`;
  report += `🔗 *Yahan Check Karo:*\n`;
  
  for (const [key, data] of Object.entries(links)) {
    report += `${data.emoji} *${data.name}*\n`;
    report += `🔗 ${data.url}\n`;
    report += `💡 ${data.couponTip}\n\n`;
  }
  
  report += `🎯 *Best Platform:* ${tips.bestPlatform}\n`;
  report += `⏰ *Best Time to Buy:* ${tips.bestTime}\n`;
  report += `💰 *Average Discount:* ${tips.avgDiscount}\n\n`;
  report += `💡 *Pro Tip:* ${tips.tip}\n\n`;
  report += `🔥 *Instant Cashback Apps:*\n`;
  report += `- PhonePe (merchant offers)\n`;
  report += `- Google Pay (cashback)\n`;
  report += `- Paytm (coins + cashback)\n`;
  report += `- CRED (CC users)\n\n`;
  report += `*Extra Tip:* CamelCamelCamel (Amazon price history) aur Flipshope extension use karo free mein!`;
  
  return report;
}

// Compare two prices
function compareTwoPrices(item1, item2) {
  const { name: name1, price: price1, platform: p1 } = item1;
  const { name: name2, price: price2, platform: p2 } = item2;
  
  const cheaper = price1 < price2 ? item1 : item2;
  const priceDiff = Math.abs(price1 - price2);
  const priceDiffPercent = ((priceDiff / Math.max(price1, price2)) * 100).toFixed(1);
  
  return {
    recommendation: cheaper.name,
    cheaperPlatform: cheaper.platform,
    cheaperPrice: cheaper.price,
    priceDifference: priceDiff,
    percentageSaved: priceDiffPercent,
    message: `${cheaper.platform} pe Rs.${priceDiff} (${priceDiffPercent}%) sasta hai!`
  };
}

module.exports = {
  PLATFORMS,
  CATEGORY_TIPS,
  generateComparisonLinks,
  detectCategory,
  calculateSavings,
  formatPriceReport,
  compareTwoPrices
};
