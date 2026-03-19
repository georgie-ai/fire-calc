import PortfolioChart from './PortfolioChart';
import NetReturnChart from './NetReturnChart';
import RuinSummary from './RuinSummary';
import Disclaimer from './Disclaimer';

export default function ResultsPanel({ simulationResult, benchmarkResult, ruinStats, monteCarloStats, params }) {
  if (!simulationResult?.months?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Configure parameters to see results
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RuinSummary
        ruinStats={ruinStats}
        monteCarloStats={monteCarloStats}
        simulationResult={simulationResult}
        startDate={params.startDate}
        startingCapital={params.startingCapital}
      />
      <PortfolioChart
        data={simulationResult.months}
        benchmarkData={benchmarkResult?.months}
        inflationAdjusted={params.inflationAdjusted}
      />
      <NetReturnChart
        data={simulationResult.months}
        benchmarkData={benchmarkResult?.months}
        inflationAdjusted={params.inflationAdjusted}
      />
      <Disclaimer />
    </div>
  );
}
