import { getPairedReturnsAndInflation } from './dataHelpers';

const SAMPLE_INTERVAL = 6; // downsample paths every 6 months (matches historical)
const CHART_PATHS = 100;   // max paths to include for spaghetti chart visualization

/**
 * Mulberry32 — simple seeded 32-bit PRNG.
 * Returns a function that produces random floats in [0, 1).
 */
function mulberry32(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simple hash of simulation params to produce a deterministic seed.
 */
function hashParams(params) {
  const str = `${params.startingCapital}-${params.monthlySpending}-${params.monthlyContribution}-${params.vehicle}-${params.windowMonths}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

/**
 * Calculate probability of ruin using Monte Carlo bootstrap resampling.
 *
 * Randomly samples actual historical monthly returns (with replacement)
 * to build thousands of hypothetical paths. Preserves the real distribution
 * of returns (fat tails, skewness) without assuming normality.
 *
 * Returns and CPI are sampled as pairs to preserve their correlation.
 */
export function calculateMonteCarloRuin({
  startingCapital,
  monthlySpending,
  monthlyContribution,
  keepAdding,
  vehicle,
  inflationMode,
  windowMonths,
  ruinThreshold = 0.5,
  numTrials = 3000,
}) {
  const pairs = getPairedReturnsAndInflation(vehicle);
  if (pairs.length === 0 || windowMonths <= 0) {
    return emptyResult(windowMonths);
  }

  const seed = hashParams({ startingCapital, monthlySpending, monthlyContribution, vehicle, windowMonths });
  const random = mulberry32(seed);
  const n = pairs.length;
  const ruinLevel = startingCapital * ruinThreshold;

  // Decide which trials to include in chart visualization
  const chartStride = Math.max(1, Math.floor(numTrials / CHART_PATHS));

  let ruins = 0;
  const ruinDurations = [];
  const endingValues = [];
  const trialPaths = [];

  for (let trial = 0; trial < numTrials; trial++) {
    let portfolioValue = startingCapital;
    let currentSpending = monthlySpending;
    let currentContribution = monthlyContribution;
    let isRuined = false;
    let ruinMonth = null;

    // Track CPI samples for annual inflation adjustment
    const recentCpiRates = [];

    // Should we record this trial's path for the chart?
    const recordPath = trial % chartStride === 0;
    const values = recordPath ? [] : null;

    for (let m = 0; m < windowMonths; m++) {
      // Sample a random historical month
      const idx = Math.floor(random() * n);
      const { monthReturn, cpiMonthlyRate } = pairs[idx];

      // Track monthly CPI rates for annual inflation adjustment
      recentCpiRates.push(cpiMonthlyRate);

      // Every 12 months (starting at month 12), adjust spending/contributions for inflation
      if (m > 0 && m % 12 === 0) {
        // Compound the last 12 monthly CPI rates to get annual inflation
        let annualInflation = 1;
        for (let k = recentCpiRates.length - 12; k < recentCpiRates.length; k++) {
          annualInflation *= (1 + recentCpiRates[k]);
        }
        annualInflation -= 1;

        if (inflationMode === 'bear') {
          annualInflation += 0.02;
        }

        currentSpending *= (1 + annualInflation);
        if (keepAdding) {
          currentContribution *= (1 + annualInflation);
        }
      }

      // Apply return
      if (portfolioValue > 0) {
        portfolioValue *= (1 + monthReturn);

        if (keepAdding) {
          portfolioValue += currentContribution;
        }

        portfolioValue -= currentSpending;

        if (portfolioValue <= 0) {
          portfolioValue = 0;
        }
      }

      // Check for ruin (50% drawdown threshold)
      if (!isRuined && portfolioValue <= ruinLevel) {
        isRuined = true;
        ruinMonth = m + 1;
      }

      // Downsample for chart
      if (recordPath) {
        const isSample = m % SAMPLE_INTERVAL === 0;
        const isLast = m === windowMonths - 1;
        const isRuinPoint = isRuined && ruinMonth === m + 1;
        if (isSample || isLast || isRuinPoint) {
          values.push({ month: m, value: Math.round(portfolioValue * 100) / 100 });
        }
      }
    }

    if (isRuined) {
      ruins++;
      ruinDurations.push(ruinMonth);
    }

    endingValues.push(Math.round(portfolioValue * 100) / 100);

    if (recordPath) {
      trialPaths.push({
        startDate: `mc-${String(trial).padStart(4, '0')}`,
        isRuined,
        ruinMonth: isRuined ? ruinMonth : null,
        values,
        source: 'montecarlo',
      });
    }
  }

  // Compute statistics
  let averageTimeToRuinMonths = null;
  let medianTimeToRuinMonths = null;
  let worstTimeToRuinMonths = null;

  if (ruinDurations.length > 0) {
    ruinDurations.sort((a, b) => a - b);
    averageTimeToRuinMonths = Math.round(
      ruinDurations.reduce((a, b) => a + b, 0) / ruinDurations.length
    );
    medianTimeToRuinMonths = ruinDurations[Math.floor(ruinDurations.length / 2)];
    worstTimeToRuinMonths = ruinDurations[0];
  }

  endingValues.sort((a, b) => a - b);
  const medianEndingValue = endingValues.length > 0
    ? endingValues[Math.floor(endingValues.length / 2)]
    : null;
  const percentile10EndingValue = endingValues.length > 0
    ? endingValues[Math.floor(endingValues.length * 0.1)]
    : null;
  const percentile90EndingValue = endingValues.length > 0
    ? endingValues[Math.floor(endingValues.length * 0.9)]
    : null;
  const decliningCount = endingValues.filter(v => v < startingCapital).length;
  const pctDeclining = numTrials > 0 ? decliningCount / numTrials : null;

  return {
    probabilityOfRuin: numTrials > 0 ? ruins / numTrials : 0,
    trialsRun: numTrials,
    ruinCount: ruins,
    averageTimeToRuinMonths,
    medianTimeToRuinMonths,
    worstTimeToRuinMonths,
    trialPaths,
    windowMonths,
    medianEndingValue,
    pctDeclining,
    percentile10EndingValue,
    percentile90EndingValue,
  };
}

function emptyResult(windowMonths) {
  return {
    probabilityOfRuin: 0,
    trialsRun: 0,
    ruinCount: 0,
    averageTimeToRuinMonths: null,
    medianTimeToRuinMonths: null,
    worstTimeToRuinMonths: null,
    trialPaths: [],
    windowMonths,
    medianEndingValue: null,
    pctDeclining: null,
    percentile10EndingValue: null,
    percentile90EndingValue: null,
  };
}
