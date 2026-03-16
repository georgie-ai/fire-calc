import { runSimulation } from './simulate';
import { getAllAvailableDates, dateDiffMonths } from './dataHelpers';

const SAMPLE_INTERVAL = 6; // sample every 6th month for chart performance

/**
 * Calculate probability of ruin using rolling historical start dates.
 * Runs the simulation from every possible starting month that allows
 * at least `windowMonths` months of data.
 * Also returns downsampled trial paths for the spaghetti chart,
 * plus sustainability metrics (median ending value, % declining, etc.)
 */
export function calculateProbabilityOfRuin(params, windowMonths) {
  const allDates = getAllAvailableDates(params.vehicle);
  if (allDates.length === 0 || windowMonths <= 0) {
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

  const lastDate = allDates[allDates.length - 1];
  let trials = 0;
  let ruins = 0;
  const ruinDurations = [];
  const trialPaths = [];
  const endingValues = [];

  for (const startDate of allDates) {
    const availableMonths = dateDiffMonths(startDate, lastDate);
    if (availableMonths < windowMonths) break;

    const result = runSimulation({
      ...params,
      startDate,
      inflationAdjusted: false, // ruin calc uses nominal values
    });

    trials++;

    const isRuined = result.isRuined && result.ruinMonths <= windowMonths;

    if (isRuined) {
      ruins++;
      ruinDurations.push(result.ruinMonths);
    }

    // Track the ending portfolio value at the window boundary
    // Simulation now continues past ruin, so always use actual ending value
    const endIdx = Math.min(windowMonths, result.months.length) - 1;
    endingValues.push(result.months[endIdx].nominalValue);

    // Collect downsampled path for spaghetti chart
    const values = [];
    const effectiveWindow = Math.min(windowMonths, result.months.length);
    for (let m = 0; m < effectiveWindow; m++) {
      const isSamplePoint = m % SAMPLE_INTERVAL === 0;
      const isLast = m === effectiveWindow - 1;
      const isRuinPoint = isRuined && result.ruinMonths === m + 1;

      if (isSamplePoint || isLast || isRuinPoint) {
        values.push({ month: m, value: result.months[m].nominalValue });
      }
    }

    trialPaths.push({
      startDate,
      isRuined,
      ruinMonth: isRuined ? result.ruinMonths : null,
      values,
    });
  }

  let averageTimeToRuinMonths = null;
  let medianTimeToRuinMonths = null;
  let worstTimeToRuinMonths = null;

  if (ruinDurations.length > 0) {
    ruinDurations.sort((a, b) => a - b);
    averageTimeToRuinMonths = Math.round(
      ruinDurations.reduce((a, b) => a + b, 0) / ruinDurations.length
    );
    medianTimeToRuinMonths = ruinDurations[Math.floor(ruinDurations.length / 2)];
    worstTimeToRuinMonths = ruinDurations[0]; // fastest ruin
  }

  // Sustainability metrics
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
  const decliningCount = endingValues.filter(v => v < params.startingCapital).length;
  const pctDeclining = trials > 0 ? decliningCount / trials : null;

  return {
    probabilityOfRuin: trials > 0 ? ruins / trials : 0,
    trialsRun: trials,
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
