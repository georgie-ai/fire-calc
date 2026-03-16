const START_DATES = [
  { label: '1960', value: '1960-01' },
  { label: '1970', value: '1970-01' },
  { label: '1980', value: '1980-01' },
  { label: '1990', value: '1990-01' },
  { label: '2000', value: '2000-01' },
  { label: '2010', value: '2010-01' },
  { label: '2020', value: '2020-01' },
];

const VEHICLES = [
  { label: 'S&P 500 (SPX)', value: 'spx' },
  { label: 'Nasdaq 100 (NDX)', value: 'ndx' },
  { label: 'Cash Account (Fed Funds Rate)', value: 'cash' },
];

const INFLATION_OPTIONS = [
  { label: 'Actual US CPI', value: 'actual' },
  { label: 'Bear Case (CPI + 2%)', value: 'bear' },
];

function Toggle({ label, checked, onChange, note }) {
  return (
    <div>
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            checked ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </label>
      {note && <p className="mt-1 text-xs text-gray-400">{note}</p>}
    </div>
  );
}

function formatNumber(value) {
  if (value === '' || value == null) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US');
}

function NumberInput({ label, value, onChange, note, min = 0, step = 1000 }) {
  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, '');
    const num = parseFloat(raw);
    onChange(isNaN(num) ? 0 : num);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={formatNumber(value)}
          onChange={handleChange}
          min={min}
          step={step}
          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
      {note && <p className="mt-1 text-xs text-gray-400">{note}</p>}
    </div>
  );
}

function SelectInput({ label, value, onChange, options, note }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {note && <p className="mt-1 text-xs text-gray-400">{note}</p>}
    </div>
  );
}

export default function InputPanel({ params, onChange }) {
  const update = (key) => (value) => onChange({ ...params, [key]: value });

  const startYear = parseInt(params.startDate.split('-')[0], 10);
  const ndxWarning =
    params.vehicle === 'ndx' && startYear < 1985
      ? 'NDX data starts from 1985. Simulation will begin from Jan 1985.'
      : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Parameters</h2>

      <NumberInput
        label="Starting Capital"
        value={params.startingCapital}
        onChange={update('startingCapital')}
      />

      <SelectInput
        label="Starting Date"
        value={params.startDate}
        onChange={update('startDate')}
        options={START_DATES}
      />

      <SelectInput
        label="Investment Vehicle"
        value={params.vehicle}
        onChange={update('vehicle')}
        options={VEHICLES}
        note={ndxWarning}
      />

      <SelectInput
        label="Inflation Assumption"
        value={params.inflationMode}
        onChange={update('inflationMode')}
        options={INFLATION_OPTIONS}
        note="Used to adjust spending & contributions annually"
      />

      <Toggle
        label="Inflation-Adjusted Returns"
        checked={params.inflationAdjusted}
        onChange={update('inflationAdjusted')}
        note="Show values in today's purchasing power"
      />

      <hr className="border-gray-100" />

      <Toggle
        label="Keep Adding (Working)"
        checked={params.keepAdding}
        onChange={update('keepAdding')}
      />

      {params.keepAdding && (
        <NumberInput
          label="Monthly Contribution"
          value={params.monthlyContribution}
          onChange={update('monthlyContribution')}
          note="Adjusted annually for inflation on Jan 1st"
          step={500}
        />
      )}

      <hr className="border-gray-100" />

      <NumberInput
        label="Monthly Spending (Withdrawal)"
        value={params.monthlySpending}
        onChange={update('monthlySpending')}
        note="Adjusted annually based on trailing 12-month CPI on Jan 1st"
        step={500}
      />
    </div>
  );
}
