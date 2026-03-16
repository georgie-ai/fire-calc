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
  Legend,
} from 'recharts';

function formatDollar(value) {
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  if (value <= -1e6) return `-$${(Math.abs(value) / 1e6).toFixed(1)}M`;
  if (value <= -1e3) return `-$${(Math.abs(value) / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatTooltipDate(dateStr) {
  const [year, month] = dateStr.split('-');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[parseInt(month) - 1]} ${year}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-medium text-gray-900 mb-1">{formatTooltipDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatDollar(entry.value)}
        </p>
      ))}
    </div>
  );
}

function getYearTicks(data) {
  if (!data?.length) return [];
  const ticks = [];
  let lastYear = null;
  for (const d of data) {
    const year = parseInt(d.date.split('-')[0]);
    if (year % 5 === 0 && year !== lastYear && d.date.endsWith('-01')) {
      ticks.push(d.date);
      lastYear = year;
    }
  }
  return ticks;
}

export default function PortfolioChart({ data, benchmarkData, inflationAdjusted }) {
  if (!data?.length) return null;

  // Merge benchmark data into chart data
  const mergedData = useMemo(() => {
    if (!benchmarkData?.length) return data;
    const benchmarkMap = new Map(benchmarkData.map((d) => [d.date, d.portfolioValue]));
    return data.map((d) => ({
      ...d,
      benchmark: benchmarkMap.get(d.date) ?? null,
    }));
  }, [data, benchmarkData]);

  const ticks = getYearTicks(data);
  const title = inflationAdjusted
    ? 'Total Portfolio Value (Inflation-Adjusted)'
    : 'Total Portfolio Value';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={mergedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={(d) => d.split('-')[0]}
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis
            tickFormatter={formatDollar}
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={0} stroke="#e5e7eb" />
          {benchmarkData && (
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="#9ca3af"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              name="Index Benchmark (Buy & Hold)"
            />
          )}
          <Line
            type="monotone"
            dataKey="portfolioValue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Portfolio Value"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
