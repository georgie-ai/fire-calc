import PortfolioChart from './PortfolioChart';
import NetReturnChart from './NetReturnChart';
import RuinSummary from './RuinSummary';
import Disclaimer from './Disclaimer';

export default function ResultsPanel({ simulationResult, benchmarkResult, ruinStats, params }) {
  if (!simulationResult?.months?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Configure parameters to see results
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      <RuinSummary
        ruinStats={ruinStats}
        simulationResult={simulationResult}
        startDate={params.startDate}
      />
      <Disclaimer />
    </div>
  );
}
