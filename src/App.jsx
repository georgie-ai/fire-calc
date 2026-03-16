import { useState } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import { useSimulation } from './hooks/useSimulation';

const DEFAULT_PARAMS = {
  startingCapital: 500000,
  startDate: '2000-01',
  vehicle: 'spx',
  inflationAdjusted: false,
  inflationMode: 'actual',
  keepAdding: false,
  monthlyContribution: 2000,
  monthlySpending: 4000,
};

function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const { simulationResult, benchmarkResult, ruinStats, monteCarloStats } = useSimulation(params);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <Header />
        <div className="flex flex-col lg:flex-row gap-6 pb-12">
          <div className="w-full lg:w-[360px] shrink-0">
            <div className="lg:sticky lg:top-6">
              <InputPanel params={params} onChange={setParams} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <ResultsPanel
              simulationResult={simulationResult}
              benchmarkResult={benchmarkResult}
              ruinStats={ruinStats}
              monteCarloStats={monteCarloStats}
              params={params}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
