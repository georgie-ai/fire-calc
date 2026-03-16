import {
  getMonthlyReturn,
  getTrailing12MonthInflation,
  getCumulativeInflation,
  getDateRange,
  isJanuary,
} from './dataHelpers';

/**
 * Run a month-by-month portfolio simulation.
 *
 * @param {Object} params
 * @param {number} params.startingCapital
 * @param {string} params.startDate - e.g. "2000-01"
 * @param {string} params.vehicle - "spx" | "ndx" | "cash"
 * @param {boolean} params.inflationAdjusted - show real values
 * @param {string} params.inflationMode - "actual" | "bear"
 * @param {boolean} params.keepAdding
 * @param {number} params.monthlyContribution
 * @param {number} params.monthlySpending
 * @param {number} [params.ruinThreshold=0.5] - fraction of startingCapital that counts as ruin (0.5 = 50% drawdown)
 * @returns {Object} simulation result
 */
export function runSimulation(params) {
  const {
    startingCapital,
    startDate,
    vehicle,
    inflationAdjusted,
    inflationMode,
    keepAdding,
    monthlyContribution,
    monthlySpending,
    ruinThreshold = 0.5,
  } = params;

  const dates = getDateRange(startDate, vehicle);
  if (dates.length === 0) {
    return { months: [], isRuined: false, ruinDate: null, ruinMonths: null, finalValue: 0 };
  }

  const ruinLevel = startingCapital * ruinThreshold;

  let portfolioValue = startingCapital;
  let currentMonthlySpending = monthlySpending;
  let currentMonthlyContribution = monthlyContribution;
  let totalContributions = startingCapital;
  let totalWithdrawals = 0;
  let isRuined = false;
  let ruinDate = null;
  let ruinMonths = null;

  const months = [];

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];

    // On January 1st (except the very first month), adjust spending and contributions
    if (isJanuary(date) && i > 0) {
      let trailing12m = getTrailing12MonthInflation(date);
      if (inflationMode === 'bear') {
        trailing12m += 0.02;
      }
      currentMonthlySpending *= (1 + trailing12m);
      if (keepAdding) {
        currentMonthlyContribution *= (1 + trailing12m);
      }
    }

    // Apply investment return (continue even after ruin so charts show full path)
    if (portfolioValue > 0) {
      const monthlyReturn = getMonthlyReturn(vehicle, date);
      portfolioValue *= (1 + monthlyReturn);

      // Add contributions
      if (keepAdding) {
        portfolioValue += currentMonthlyContribution;
        totalContributions += currentMonthlyContribution;
      }

      // Subtract spending
      portfolioValue -= currentMonthlySpending;
      totalWithdrawals += currentMonthlySpending;

      // Clamp to zero if fully depleted
      if (portfolioValue <= 0) {
        portfolioValue = 0;
      }
    }

    // Check for ruin (50% drawdown threshold) — only record the first time
    if (!isRuined && portfolioValue <= ruinLevel) {
      isRuined = true;
      ruinDate = date;
      ruinMonths = i + 1;
    }

    // Calculate display value
    let displayValue = portfolioValue;
    let displayContribBasis = totalContributions - totalWithdrawals;
    if (inflationAdjusted) {
      const cumulativeInflation = getCumulativeInflation(startDate, date);
      if (cumulativeInflation > 0) {
        displayValue = portfolioValue / cumulativeInflation;
        displayContribBasis = displayContribBasis / cumulativeInflation;
      }
    }

    months.push({
      date,
      portfolioValue: Math.round(displayValue * 100) / 100,
      costBasis: Math.round(displayContribBasis * 100) / 100,
      nominalValue: Math.round(portfolioValue * 100) / 100,
      totalContributions: Math.round(totalContributions * 100) / 100,
      totalWithdrawals: Math.round(totalWithdrawals * 100) / 100,
    });
  }

  return {
    months,
    isRuined,
    ruinDate,
    ruinMonths,
    finalValue: months.length > 0 ? months[months.length - 1].portfolioValue : 0,
  };
}

/**
 * Run simulation without withdrawals/contributions (pure investment growth)
 * for the "total return" chart.
 */
export function runTotalReturnSimulation(params) {
  return runSimulation({
    ...params,
    monthlySpending: 0,
    monthlyContribution: 0,
    keepAdding: false,
  });
}
