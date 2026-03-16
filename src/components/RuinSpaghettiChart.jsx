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

function buildChartData(trialPaths) {
  // Pre-index each trial's values by month
  const trialMaps = trialPaths.map((trial) => {
    const map = new Map();
    trial.values.forEach((pt) => map.set(pt.month, pt.value));
    return map;
  });

  // Collect all unique month indices
  const monthSet = new Set();
  for (const trial of trialPaths) {
    for (const pt of trial.values) {
      monthSet.add(pt.month);
    }
  }
  const months = Array.from(monthSet).sort((a, b) => a - b);

  // Build row-oriented data for Recharts
  return months.map((month) => {
    const row = { month };
    trialMaps.forEach((map, i) => {
      if (map.has(month)) row[`t${i}`] = map.get(month);
    });
    return row;
  });
}

function SpaghettiTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const month = label;
  const year = Math.floor(month / 12);
  const values = payload.filter((p) => p.value != null).map((p) => p.value);
  if (values.length === 0) return null;

  const alive = values.filter((v) => v > 0).length;
  values.sort((a, b) => a - b);
  const median = values[Math.floor(values.length / 2)];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-medium text-gray-900">Year {year}</p>
      <p className="text-gray-600">
        {alive} of {values.length} scenarios surviving
      </p>
      <p className="text-gray-600">Median portfolio: {formatDollar(median)}</p>
    </div>
  );
}

export default function RuinSpaghettiChart({ trialPaths, windowMonths }) {
  const chartData = useMemo(() => {
    if (!trialPaths?.length) return [];
    return buildChartData(trialPaths);
  }, [trialPaths]);

  if (!chartData.length || !trialPaths?.length) return null;

  // Generate ticks every 5 years
  const ticks = [];
  for (let y = 0; y <= Math.ceil(windowMonths / 12); y += 5) {
    ticks.push(y * 12);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Historical Scenario Paths
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Each line shows your portfolio from a different historical start date.{' '}
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-blue-300" /> survived
        </span>{' '}
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-red-300" /> ran out of money
        </span>
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
            tickFormatter={formatDollar}
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            width={70}
          />
          <Tooltip content={<SpaghettiTooltip />} />
          <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={2} />
          {trialPaths.map((trial, i) => (
            <Line
              key={i}
              type="monotone"
              dataKey={`t${i}`}
              stroke={trial.isRuined ? '#fca5a5' : '#93c5fd'}
              strokeWidth={0.5}
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
