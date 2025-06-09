// aisf_lite_algorithm.js

/**
 * Rate Year-over-Year growth on a 1–10 scale.
 * @param {number} g - YoY growth percentage
 * @returns {number} rating (1–10)
 */
function rateGrowth(g) {
  if (g <= 0) return 1;
  if (g <= 20)  return Math.round(2 + ((g - 1) / 19) * 1);
  if (g <= 50)  return Math.round(4 + ((g - 21) / 29) * 1);
  if (g <= 100) return Math.round(6 + ((g - 51) / 49) * 1);
  if (g <= 200) return Math.round(8 + ((g - 101) / 99) * 1);
  return 10;
}

/**
 * Rate Total Addressable Market on a 1–10 scale based on size in millions.
 * @param {number} t - TAM in $M
 * @returns {number} rating (1–10)
 */
function rateTam(t) {
  if (t < 100)    return 1;
  if (t < 500)    return 3;
  if (t < 1000)   return 5;
  if (t < 5000)   return 7;
  return 9;
}

/**
 * Rate Market Penetration on a 1–10 scale.
 * @param {number} rev - Current revenue in $M
 * @param {number} t   - TAM in $M
 * @returns {number} rating (1–10)
 */
function ratePenetration(rev, t) {
  const p = (rev / t) * 100;
  if (p < 0.01) return 1;
  if (p < 0.1)  return 3;
  if (p < 1)    return 5;
  if (p < 5)    return 7;
  return 9;
}

/**
 * Generate a recommendation based on the weakest metric.
 * @param {number} gR - Growth rating
 * @param {number} tR - TAM rating
 * @param {number} pR - Penetration rating
 * @returns {string} recommendation
 */
function makeRecommendation(gR, tR, pR) {
  const lowest = Math.min(gR, tR, pR);
  if (lowest === gR) {
    if (gR < 4) return 'Your YoY growth is low—focus on customer acquisition or pricing pivots.';
    if (gR < 7) return 'Growth is moderate—consider expanding channels or partnerships.';
    return 'Growth is strong—maintain momentum and optimize unit economics.';
  }
  if (lowest === tR) {
    if (tR < 4) return 'TAM is small—reevaluate market sizing or pivot to adjacent, larger segments.';
    if (tR < 7) return 'TAM is decent—explore new verticals within your sector.';
    return 'TAM is very strong—ready to scale broadly.';
  }
  // Penetration is weakest
  if (pR < 4) return 'Early penetration—accelerate marketing and sales efforts for initial traction.';
  if (pR < 7) return 'Moderate penetration—leverage referrals or enterprise pilots.';
  return 'High penetration—consider raising price or upselling.';
}

export { rateGrowth, rateTam, ratePenetration, makeRecommendation };
