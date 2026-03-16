import { useState } from 'react';
import RuinSpaghettiChart from './RuinSpaghettiChart';

function formatMonths(totalMonths) {
  if (totalMonths == null) return 'N/A';
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years}y ${months}m`;
}

function formatTooltipDate(dateStr) {
  if (!dateStr) return 'N/A';
  const [year, month] = dateStr.split('-');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[parseInt(month) - 1]} ${year}`;
}

function RollingWindowDiagram({ windowYears, trialsRun }) {
  const bars = [
    { label: 'Jan 1980', offset: 0 },
    { label: 'Jul 1982', offset: 1 },
    { label: 'Jan 1985', offset: 2 },
    { label: 'Jul 1987', offset: 3 },
    { label: '...', offset: 4 },
  ];

  return (
    <div className="mt-3 mb-1">
      <div className="text-[10px] text-gray-400 flex justify-between mb-1 px-1">
        <span>1980</span>
        <span>1990</span>
        <span>2000</span>
        <span>2010</span>
        <span>2025</span>
      </div>
      <div className="relative bg-gray-100 rounded h-[88px] overflow-hidden">
        {bars.map((bar, i) => (
          <div
            key={i}
            className="absolute h-3 rounded-full flex items-center"
            style={{
              left: `${bar.offset * 7 + 2}%`,
              width: `${Math.min(windowYears * 2.2, 66)}%`,
              top: `${i * 16 + 6}px`,
              backgroundColor: i % 2 === 0 ? '#93c5fd' : '#6ee7b7',
              opacity: 0.7,
            }}
          >
            <span className="text-[9px] text-gray-600 ml-1.5 whitespace-nowrap font-medium">
              {bar.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-1 text-center">
        {trialsRun} overlapping {windowYears}-year windows sliding 1 month at a time
      </p>
    </div>
  );
}

function formatDollar(value) {
  if (value == null) return 'N/A';
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

/**
 * Determine the overall "health" of the plan based on ruin probability
 * AND sustainability metrics (is the portfolio shrinking even if not ruined?)
 */
function getHealthLevel(probabilityOfRuin, pctDeclining, medianEndingValue, startingCapital) {
  // Hard ruin: many trials hit $0
  if (probabilityOfRuin >= 0.3) return 'danger';
  if (probabilityOfRuin >= 0.1) return 'warning';

  // Soft ruin: portfolio is shrinking in most scenarios even if it hasn't hit $0
  if (pctDeclining != null && medianEndingValue != null) {
    const medianReturnRatio = medianEndingValue / startingCapital;
    // If > 70% of scenarios end below starting capital, it's unsustainable
    if (pctDeclining >= 0.7 || medianReturnRatio < 0.5) return 'warning';
    // If > 50% declining and median is only modestly above, caution
    if (pctDeclining >= 0.5 && medianReturnRatio < 1.5) return 'caution';
  }

  return 'healthy';
}

const healthStyles = {
  danger:  { colorClass: 'text-red-700',    bgClass: 'bg-red-50',    borderClass: 'border-red-200' },
  warning: { colorClass: 'text-yellow-700',  bgClass: 'bg-yellow-50',  borderClass: 'border-yellow-200' },
  caution: { colorClass: 'text-amber-600',   bgClass: 'bg-amber-50',   borderClass: 'border-amber-200' },
  healthy: { colorClass: 'text-green-700',   bgClass: 'bg-green-50',   borderClass: 'border-green-200' },
};

export default function RuinSummary({ ruinStats, simulationResult, startDate, startingCapital }) {
  const [showExplanation, setShowExplanation] = useState(false);

  if (!ruinStats) return null;

  const {
    probabilityOfRuin, trialsRun, ruinCount,
    averageTimeToRuinMonths, worstTimeToRuinMonths,
    trialPaths, windowMonths,
    medianEndingValue, pctDeclining,
    percentile10EndingValue, percentile90EndingValue,
  } = ruinStats;

  const pctRuin = (probabilityOfRuin * 100).toFixed(1);
  const windowYears = Math.round(windowMonths / 12);

  const health = getHealthLevel(probabilityOfRuin, pctDeclining, medianEndingValue, startingCapital);
  const { colorClass, bgClass, borderClass } = healthStyles[health];

  const pctDecliningDisplay = pctDeclining != null ? (pctDeclining * 100).toFixed(0) : null;

  return (
    <div>
      <div className={`rounded-xl border-2 ${borderClass} ${bgClass} p-6`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Probability of Ruin</h3>

        <div className="flex items-baseline gap-2 mb-4">
          <span className={`text-5xl font-bold ${colorClass}`}>{pctRuin}%</span>
          <span className="text-sm text-gray-500">chance of running out of money</span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>
            Based on <span className="font-medium text-gray-900">{trialsRun}</span> historical
            scenarios ({ruinCount} resulted in ruin)
          </p>

          {simulationResult?.isRuined ? (
            <p className="text-red-600 font-medium">
              Your selected scenario runs out of money in{' '}
              {formatTooltipDate(simulationResult.ruinDate)} ({formatMonths(simulationResult.ruinMonths)}{' '}
              from start)
            </p>
          ) : (
            <p className="text-green-600 font-medium">
              Your selected scenario ({startDate.split('-')[0]} start) survives through end of
              available data
            </p>
          )}

          {ruinCount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Average Time to Ruin</p>
                <p className="font-medium text-gray-900">{formatMonths(averageTimeToRuinMonths)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Fastest Ruin</p>
                <p className="font-medium text-gray-900">{formatMonths(worstTimeToRuinMonths)}</p>
              </div>
            </div>
          )}

          {/* Portfolio sustainability metrics */}
          {medianEndingValue != null && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Portfolio Outlook ({windowYears}-year horizon)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Median Ending Value</p>
                  <p className="font-medium text-gray-900">{formatDollar(medianEndingValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Scenarios Ending Below Start</p>
                  <p className={`font-medium ${pctDeclining >= 0.5 ? 'text-red-600' : 'text-gray-900'}`}>
                    {pctDecliningDisplay}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Worst 10% End Below</p>
                  <p className="font-medium text-gray-900">{formatDollar(percentile10EndingValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Best 10% End Above</p>
                  <p className="font-medium text-gray-900">{formatDollar(percentile90EndingValue)}</p>
                </div>
              </div>

              {/* Sustainability warning when ruin is 0% but portfolio is declining */}
              {probabilityOfRuin === 0 && pctDeclining >= 0.5 && (
                <div className="mt-3 p-2.5 bg-yellow-100/80 rounded-lg text-xs text-yellow-800">
                  <strong>Caution:</strong> While no historical scenario hit $0, {pctDecliningDisplay}% of
                  scenarios ended with less than your starting capital. Your withdrawal rate may not be
                  sustainable long-term.
                </div>
              )}
            </div>
          )}

          {/* Collapsible methodology explanation */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <svg
                className={`w-3 h-3 transition-transform ${showExplanation ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              How is this calculated?
            </button>

            {showExplanation && (
              <div className="mt-3 p-3 bg-white/60 rounded-lg text-xs text-gray-600 space-y-2">
                <p>
                  We replay your exact parameters (starting capital, spending, contributions,
                  investment vehicle) across every possible <strong>{windowYears}-year window</strong> in
                  our historical dataset (Jan 1980 &ndash; Dec 2025).
                </p>
                <p>
                  Each window starts one month later than the previous, creating{' '}
                  <strong>{trialsRun} independent scenarios</strong>. If your portfolio hits $0 in a
                  scenario, that counts as &ldquo;ruin.&rdquo;
                </p>
                <RollingWindowDiagram windowYears={windowYears} trialsRun={trialsRun} />
                <p>
                  This uses <em>actual historical returns</em> in sequence (not random simulations),
                  so it captures real events like the dot-com crash, 2008 crisis, and COVID crash.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spaghetti chart showing all trial paths */}
      {trialPaths && trialPaths.length > 0 && (
        <RuinSpaghettiChart trialPaths={trialPaths} windowMonths={windowMonths} />
      )}
    </div>
  );
}
