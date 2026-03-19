import { useState } from 'react';

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
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

function formatDollar(value) {
  if (value == null) return 'N/A';
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function RollingWindowDiagram({ windowYears, trialsRun }) {
  const bars = [
    { label: 'Window 1', offset: 0 },
    { label: 'Window 2', offset: 1 },
    { label: 'Window 3', offset: 2 },
    { label: 'Window 4', offset: 3 },
    { label: '...', offset: 4 },
  ];

  return (
    <div className="mt-3 mb-1">
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

/**
 * Determine the overall "health" using the worse of the two probabilities.
 */
function getHealthLevel(histProb, mcProb) {
  const worstProb = Math.max(histProb ?? 0, mcProb ?? 0);
  if (worstProb >= 0.3) return 'danger';
  if (worstProb >= 0.1) return 'warning';
  if (worstProb >= 0.05) return 'caution';
  return 'healthy';
}

const healthStyles = {
  danger:  { colorClass: 'text-red-700',    bgClass: 'bg-red-50',    borderClass: 'border-red-200' },
  warning: { colorClass: 'text-yellow-700',  bgClass: 'bg-yellow-50',  borderClass: 'border-yellow-200' },
  caution: { colorClass: 'text-amber-600',   bgClass: 'bg-amber-50',   borderClass: 'border-amber-200' },
  healthy: { colorClass: 'text-green-700',   bgClass: 'bg-green-50',   borderClass: 'border-green-200' },
};

function ScenarioCommentary({
  histProb, mcProb, health, windowYears, startingCapital,
  medianEndingValue, pctDeclining, averageTimeToRuinMonths,
  percentile10EndingValue, percentile90EndingValue,
}) {
  const worstProb = Math.max(histProb ?? 0, mcProb ?? 0);
  const bestProb = Math.min(histProb ?? 1, mcProb ?? 1);
  const medianGrowth = medianEndingValue != null ? (medianEndingValue / startingCapital - 1) * 100 : null;

  const bullets = [];

  // Overall verdict
  if (health === 'danger') {
    if (worstProb >= 0.8) {
      bullets.push('This plan has a very high probability of failure. At this withdrawal rate, the vast majority of historical and simulated scenarios end in ruin well before the end of the time horizon.');
    } else if (worstProb >= 0.5) {
      bullets.push('This plan fails in more than half of all scenarios tested. The withdrawal rate is too aggressive for the portfolio size.');
    } else {
      bullets.push('There is a significant risk of running out of money. More than 1 in 3 scenarios result in the portfolio dropping below the ruin threshold.');
    }
  } else if (health === 'warning') {
    bullets.push(`Between 10–30% of scenarios result in ruin over ${windowYears} years. This plan could work, but has meaningful downside risk — especially if markets underperform early in retirement.`);
  } else if (health === 'caution') {
    bullets.push(`A small but non-trivial number of scenarios (5–10%) result in ruin. The plan is likely sustainable, but vulnerable to a severe early downturn like 2000–2002 or 2008.`);
  } else {
    bullets.push(`This plan survives the vast majority of historical and simulated scenarios over ${windowYears} years. The withdrawal rate appears sustainable.`);
  }

  // Median outcome
  if (medianEndingValue != null) {
    if (medianEndingValue <= 0) {
      bullets.push('The median portfolio ends at $0 — meaning more than half of all scenarios are completely depleted by the end of the horizon.');
    } else if (medianGrowth < -50) {
      bullets.push(`The median portfolio loses more than half its value, ending at ${formatDollar(medianEndingValue)}. Even surviving scenarios see heavy erosion.`);
    } else if (medianGrowth < 0) {
      bullets.push(`The median portfolio shrinks to ${formatDollar(medianEndingValue)} — withdrawals outpace investment growth in the typical case.`);
    } else if (medianGrowth > 100) {
      bullets.push(`In the median case, the portfolio more than doubles to ${formatDollar(medianEndingValue)}, suggesting the withdrawal rate is conservative relative to historical growth.`);
    } else if (medianGrowth > 0) {
      bullets.push(`The median portfolio grows to ${formatDollar(medianEndingValue)}, indicating that investment returns generally outpace withdrawals.`);
    }
  }

  // Tail risk
  if (percentile10EndingValue != null && percentile90EndingValue != null) {
    if (percentile10EndingValue <= 0 && percentile90EndingValue > startingCapital * 2) {
      bullets.push(`Outcomes are extremely spread: the worst 10% are completely wiped out, while the best 10% end above ${formatDollar(percentile90EndingValue)}. Sequence-of-returns risk is the dominant factor.`);
    } else if (percentile10EndingValue <= 0) {
      bullets.push('The worst 10% of scenarios end with nothing. A bad stretch of early returns could be devastating.');
    }
  }

  // Time to ruin
  if (averageTimeToRuinMonths != null && health === 'danger') {
    const avgYears = Math.floor(averageTimeToRuinMonths / 12);
    if (avgYears <= 10) {
      bullets.push(`When ruin does occur, it happens fast — on average within ${avgYears} years. There would be little time to course-correct.`);
    } else {
      bullets.push(`When ruin occurs, it takes an average of ${avgYears} years. Monitoring withdrawals and adjusting early could help avoid the worst outcomes.`);
    }
  }

  // Actionable suggestion
  if (health === 'danger' || health === 'warning') {
    bullets.push('Consider reducing monthly withdrawals, increasing starting capital, or planning for part-time income in early retirement to improve sustainability.');
  }

  if (bullets.length === 0) return null;

  const borderColor = {
    danger: 'border-red-200',
    warning: 'border-yellow-200',
    caution: 'border-amber-200',
    healthy: 'border-green-200',
  }[health];

  const iconColor = {
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    caution: 'text-amber-500',
    healthy: 'text-green-500',
  }[health];

  return (
    <div className={`mt-6 rounded-xl border ${borderColor} bg-white p-5`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className={iconColor}>
          {health === 'healthy' ? '✓' : health === 'danger' ? '✗' : '⚠'}
        </span>
        Scenario Analysis
      </h3>
      <ul className="space-y-2">
        {bullets.map((b, i) => (
          <li key={i} className="text-sm text-gray-600 leading-relaxed">
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RuinSummary({ ruinStats, monteCarloStats, simulationResult, startDate, startingCapital }) {
  const [showExplanation, setShowExplanation] = useState(false);

  if (!ruinStats) return null;

  const {
    probabilityOfRuin: histProb, trialsRun: histTrials, ruinCount: histRuinCount,
    averageTimeToRuinMonths, worstTimeToRuinMonths,
    trialPaths, windowMonths,
    medianEndingValue, pctDeclining,
    percentile10EndingValue, percentile90EndingValue,
  } = ruinStats;

  const mcProb = monteCarloStats?.probabilityOfRuin ?? null;
  const mcTrials = monteCarloStats?.trialsRun ?? 0;
  const mcRuinCount = monteCarloStats?.ruinCount ?? 0;

  const histPct = (histProb * 100).toFixed(1);
  const mcPct = mcProb != null ? (mcProb * 100).toFixed(1) : null;
  const windowYears = Math.round(windowMonths / 12);

  const health = getHealthLevel(histProb, mcProb);
  const { colorClass, bgClass, borderClass } = healthStyles[health];

  const pctDecliningDisplay = pctDeclining != null ? (pctDeclining * 100).toFixed(0) : null;
  const ruinThresholdDollar = formatDollar(startingCapital * 0.5);

  return (
    <div>
      <div className={`rounded-xl border-2 ${borderClass} ${bgClass} p-6`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Probability of Ruin</h3>

        {/* Dual probability display */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Historical</p>
            <span className={`text-4xl font-bold ${colorClass}`}>{histPct}%</span>
            <p className="text-xs text-gray-400 mt-0.5">
              {histTrials} scenarios ({histRuinCount} ruined)
            </p>
          </div>
          {mcPct != null && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Monte Carlo</p>
              <span className={`text-4xl font-bold ${colorClass}`}>{mcPct}%</span>
              <p className="text-xs text-gray-400 mt-0.5">
                {mcTrials.toLocaleString()} simulations ({mcRuinCount.toLocaleString()} ruined)
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 mb-3">
          Ruin = portfolio drops below {ruinThresholdDollar} (50% of starting capital)
        </p>

        <div className="space-y-2 text-sm text-gray-600">
          {simulationResult?.isRuined ? (
            <p className="text-red-600 font-medium">
              Your selected scenario hits ruin threshold in{' '}
              {formatTooltipDate(simulationResult.ruinDate)} ({formatMonths(simulationResult.ruinMonths)}{' '}
              from start)
            </p>
          ) : (
            <p className="text-green-600 font-medium">
              Your selected scenario ({startDate.split('-')[0]} start) stays above threshold through
              end of available data
            </p>
          )}

          {histRuinCount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Avg. Time to Ruin (Historical)</p>
                <p className="font-medium text-gray-900">{formatMonths(averageTimeToRuinMonths)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Fastest Ruin (Historical)</p>
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
              <div className="mt-3 p-3 bg-white/60 rounded-lg text-xs text-gray-600 space-y-3">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Historical Analysis</p>
                  <p>
                    We replay your exact parameters across every possible{' '}
                    <strong>{windowYears}-year window</strong> in our historical dataset. Each window
                    starts one month later than the previous, creating{' '}
                    <strong>{histTrials} independent scenarios</strong>. If your portfolio drops below
                    50% of starting capital, that counts as &ldquo;ruin.&rdquo;
                  </p>
                  <RollingWindowDiagram windowYears={windowYears} trialsRun={histTrials} />
                  <p>
                    This uses <em>actual historical returns</em> in sequence, so it captures real events
                    like the dot-com crash, 2008 crisis, and COVID crash.
                  </p>
                </div>
                {mcPct != null && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Monte Carlo Simulation</p>
                    <p>
                      We also run <strong>{mcTrials.toLocaleString()} simulated paths</strong> by
                      randomly sampling real historical monthly returns (bootstrap resampling). This
                      tests your plan against thousands of possible market sequences &mdash; not just
                      the ones that actually happened. It can reveal risks that the limited historical
                      record might miss.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scenario commentary */}
      <ScenarioCommentary
        histProb={histProb}
        mcProb={mcProb}
        health={health}
        windowYears={windowYears}
        startingCapital={startingCapital}
        medianEndingValue={medianEndingValue}
        pctDeclining={pctDeclining}
        averageTimeToRuinMonths={averageTimeToRuinMonths}
        percentile10EndingValue={percentile10EndingValue}
        percentile90EndingValue={percentile90EndingValue}
      />
    </div>
  );
}
