export default function Disclaimer() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-xs text-gray-500 space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Important Disclaimers</h4>
      <ul className="list-disc pl-4 space-y-1">
        <li>
          This calculator is for educational and informational purposes only and does not constitute
          investment, tax, or legal advice.
        </li>
        <li>
          Past performance does not guarantee future results. Actual investment returns, inflation
          rates, and economic conditions may differ materially from historical data.
        </li>
        <li>
          The S&P 500 and Nasdaq 100 returns used are price returns and do not include dividends,
          which may understate total returns.
        </li>
        <li>
          This tool does not account for taxes, investment fees, transaction costs, or other expenses
          that would reduce actual returns.
        </li>
        <li>
          The probability of ruin is based on historical scenarios and may not reflect future market
          conditions or black swan events.
        </li>
        <li>
          Consult a qualified financial advisor before making any investment or retirement planning
          decisions.
        </li>
        <li>
          Data sources may contain inaccuracies. No warranty is provided regarding the accuracy or
          completeness of the data.
        </li>
      </ul>
    </div>
  );
}
