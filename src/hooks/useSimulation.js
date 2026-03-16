import { useMemo } from 'react';
import { runSimulation, runTotalReturnSimulation } from '../engine/simulate';
import { calculateProbabilityOfRuin } from '../engine/probabilityOfRuin';
import { calculateMonteCarloRuin } from '../engine/monteCarloRuin';
import { dateDiffMonths, getLastAvailableDate } from '../engine/dataHelpers';

export function useSimulation(params) {
  const simulationResult = useMemo(() => {
    if (!params.startingCapital && !params.keepAdding) return null;
    return runSimulation(params);
  }, [
    params.startingCapital,
    params.startDate,
    params.vehicle,
    params.inflationAdjusted,
    params.inflationMode,
    params.keepAdding,
    params.monthlyContribution,
    params.monthlySpending,
  ]);

  // Benchmark: pure buy-and-hold with no withdrawals or contributions
  const benchmarkResult = useMemo(() => {
    if (!params.startingCapital) return null;
    return runTotalReturnSimulation(params);
  }, [
    params.startingCapital,
    params.startDate,
    params.vehicle,
    params.inflationAdjusted,
    params.inflationMode,
  ]);

  const ruinStats = useMemo(() => {
    const lastDate = getLastAvailableDate(params.vehicle);
    if (!lastDate) return null;
    const totalMonths = dateDiffMonths(params.startDate, lastDate);
    if (totalMonths <= 0) return null;
    // Cap at 30 years for meaningful rolling-window probability
    const windowMonths = Math.min(totalMonths, 30 * 12);
    return calculateProbabilityOfRuin(params, windowMonths);
  }, [
    params.startingCapital,
    params.startDate,
    params.vehicle,
    params.inflationMode,
    params.keepAdding,
    params.monthlyContribution,
    params.monthlySpending,
  ]);

  // Monte Carlo bootstrap simulation
  const monteCarloStats = useMemo(() => {
    const lastDate = getLastAvailableDate(params.vehicle);
    if (!lastDate) return null;
    const totalMonths = dateDiffMonths(params.startDate, lastDate);
    if (totalMonths <= 0) return null;
    const windowMonths = Math.min(totalMonths, 30 * 12);
    return calculateMonteCarloRuin({
      startingCapital: params.startingCapital,
      monthlySpending: params.monthlySpending,
      monthlyContribution: params.monthlyContribution,
      keepAdding: params.keepAdding,
      vehicle: params.vehicle,
      inflationMode: params.inflationMode,
      windowMonths,
    });
  }, [
    params.startingCapital,
    params.startDate,
    params.vehicle,
    params.inflationMode,
    params.keepAdding,
    params.monthlyContribution,
    params.monthlySpending,
  ]);

  return { simulationResult, benchmarkResult, ruinStats, monteCarloStats };
}
