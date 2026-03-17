import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

function formatDollar(value) {
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  if (value <= -1e6) return `-$${(Math.abs(value) / 1e6).toFixed(1)}M`;
  if (value <= -1e3) return `-$${(Math.abs(value) / 1e3).toFixed(0)}K`;
  return `$${Math.round(value)}`;
}

/**
 * Build row-oriented chart data from combined trial paths.
 * Historical paths use keys "h0", "h1", ...
 * Monte Carlo paths use keys "m0", "m1", ...
 */
function buildChartData(histPaths, mcPaths) {
  const allPaths = [];
  const keys = [];

  // Historical paths
  (histPaths || []).forEach((trial, i) => {
    const key = `h${i}`;
    keys.push(key);
    allPaths.push({ key, trial });
  });

  // Monte Carlo paths
  (mcPaths || []).forEach((trial, i) => {
    const key = `m${i}`;
    keys.push(key);
    allPaths.push({ key, trial });
  });

  // Pre-index each trial's values by month
  const trialMaps = allPaths.map(({ key, trial }) => {
    const map = new Map();
    trial.values.forEach((pt) => map.set(pt.month, pt.value));
    return { key, map };
  });

  // Collect all unique month indices
  const monthSet = new Set();
  for (const { trial } of allPaths) {
    for (const pt of trial.values) {
      monthSet.add(pt.month);
    }
  }
  const months = Array.from(monthSet).sort((a, b) => a - b);

  // Build rows
  const data = months.map((month) => {
    const row = { month };
    trialMaps.forEach(({ key, map }) => {
      if (map.has(month)) row[key] = map.get(month);
    });
    return row;
  });

  return { data, keys };
}

function SpaghettiTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const month = label;
  const year = Math.floor(month / 12);

  const histValues = [];
  const mcValues = [];
  for (const p of payload) {
    if (p.value == null) continue;
    if (p.dataKey.startsWith('h')) histValues.push(p.value);
    else if (p.dataKey.startsWith('m')) mcValues.push(p.value);
  }

  const allValues = [...histValues, ...mcValues];
  if (allValues.length === 0) return null;
  allValues.sort((a, b) => a - b);
  const median = allValues[Math.floor(allValues.length / 2)];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-medium text-gray-900">Year {year}</p>
      {histValues.length > 0 && (
        <p className="text-gray-600">
          Historical: {histValues.filter(v => v > 0).length} of {histValues.length} above threshold
        </p>
      )}
      {mcValues.length > 0 && (
        <p className="text-gray-600">
          Monte Carlo: {mcValues.filter(v => v > 0).length} of {mcValues.length} above threshold
        </p>
      )}
      <p className="text-gray-600">Median portfolio: {formatDollar(median)}</p>
    </div>
  );
}

export default function RuinSpaghettiChart({ trialPaths, monteCarloTrialPaths, windowMonths, ruinLevel, startingCapital }) {
  const { data: chartData, keys } = useMemo(() => {
    if (!trialPaths?.length) return { data: [], keys: [] };
    return buildChartData(trialPaths, monteCarloTrialPaths);
  }, [trialPaths, monteCarloTrialPaths]);

  // Build a lookup of key -> trial metadata for coloring
  const trialMeta = useMemo(() => {
    const meta = {};
    (trialPaths || []).forEach((trial, i) => {
      meta[`h${i}`] = { isRuined: trial.isRuined, source: 'historical' };
    });
    (monteCarloTrialPaths || []).forEach((trial, i) => {
      meta[`m${i}`] = { isRuined: trial.isRuined, source: 'montecarlo' };
    });
    return meta;
  }, [trialPaths, monteCarloTrialPaths]);

  // Cap Y-axis at 3x starting capital so the threshold line and most paths are visible.
  // Paths that grow beyond this just clip off the top — the chart focuses on the ruin zone.
  const yMax = useMemo(() => {
    const cap = (startingCapital || 500000) * 3;
    return cap;
  }, [startingCapital]);

  if (!chartData.length) return null;

  const hasMC = monteCarloTrialPaths && monteCarloTrialPaths.length > 0;

  // Generate ticks every 5 years
  const ticks = [];
  for (let y = 0; y <= Math.ceil(windowMonths / 12); y += 5) {
    ticks.push(y * 12);
  }

  function getStroke(key) {
    const m = trialMeta[key];
    if (!m) return '#93c5fd';
    if (m.source === 'montecarlo') {
      return m.isRuined ? '#fdba74' : '#c4b5fd';
    }
    return m.isRuined ? '#fca5a5' : '#93c5fd';
  }

  function getStrokeWidth(key) {
    return key.startsWith('m') ? 0.3 : 0.5;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {hasMC ? 'Historical & Simulated Paths' : 'Historical Scenario Paths'}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Each line shows a portfolio path.{' '}
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-blue-300" /> survived
        </span>{' '}
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-red-300" /> ruined
        </span>
        {hasMC && (
          <>
            {' '}
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-4 h-0.5 bg-purple-300" /> MC survived
            </span>{' '}
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-4 h-0.5 bg-orange-300" /> MC ruined
            </span>
          </>
        )}
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            ticks={ticks}
            tickFormatter={(m) => `Year ${Math.round(m / 12)}`}
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis
            domain={[0, yMax]}
            allowDataOverflow
            tickFormatter={formatDollar}
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            width={70}
          />
          <Tooltip content={<SpaghettiTooltip />} />
          <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={2} />
          {ruinLevel > 0 && (
            <ReferenceLine
              y={ruinLevel}
              stroke="#ef4444"
              strokeWidth={1.5}
              strokeDasharray="8 4"
              label={{
                value: '50% Threshold',
                position: 'right',
                fill: '#ef4444',
                fontSize: 11,
              }}
            />
          )}
          {keys.map((key) => (
            <Line
              key={key}
              type="linear"
              dataKey={key}
              stroke={getStroke(key)}
              strokeWidth={getStrokeWidth(key)}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
