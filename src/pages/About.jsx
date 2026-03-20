import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm mb-6 inline-block">&larr; Back to Calculator</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">About Can I FIRE Yet?</h1>
        <p className="text-sm text-gray-400 mb-8">Understanding the tool and its methodology</p>

        <div className="prose prose-gray prose-sm max-w-none space-y-6 text-gray-600">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">What Is This?</h2>
            <p>
              Can I FIRE Yet? is a free retirement calculator that helps you understand whether your
              savings and investment plan can sustain your desired lifestyle through retirement. FIRE
              stands for <strong>Financial Independence, Retire Early</strong> — a movement focused on
              aggressive saving and investing to achieve financial freedom.
            </p>
            <p>
              Unlike simple retirement calculators that assume a fixed annual return, this tool uses
              actual historical market data to show you how your plan would have performed across
              every possible starting period in history.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">How It Works</h2>
            <p>The calculator uses two complementary methods to assess your retirement plan:</p>

            <h3 className="text-base font-medium text-gray-800 mt-4">Historical Rolling Window Analysis</h3>
            <p>
              Your exact parameters are replayed across every possible starting month in our
              historical dataset. For example, with a 30-year retirement window, we simulate
              starting in January 1960, February 1960, March 1960, and so on — creating hundreds
              of independent real-world scenarios. If your portfolio drops below 50% of your
              starting capital in any scenario, that counts as "ruin."
            </p>

            <h3 className="text-base font-medium text-gray-800 mt-4">Monte Carlo Bootstrap Simulation</h3>
            <p>
              We also run thousands of simulations by randomly sampling actual historical monthly
              returns (bootstrap resampling). This preserves the real distribution of returns —
              including fat tails and extreme events — without assuming markets follow a normal
              distribution. It tests your plan against market sequences that haven't happened yet
              but statistically could.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">Data Sources</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>S&P 500 Returns:</strong> Monthly price returns from January 1960 to present.
                Note: these are price returns only and do not include dividends, which historically
                contribute roughly 2% per year to total returns.
              </li>
              <li>
                <strong>Consumer Price Index (CPI):</strong> FRED CPIAUCSL series (Consumer Price
                Index for All Urban Consumers) from January 1959 to present. Used to adjust
                spending and contributions for inflation annually.
              </li>
              <li>
                <strong>Federal Funds Rate:</strong> FRED FEDFUNDS series (Federal Funds Effective
                Rate) from January 1960 to present. Used as the cash/money market return rate.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">Important Limitations</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>No dividends:</strong> Equity returns are price-only. Actual total returns
                would be higher, meaning ruin probabilities shown here are somewhat conservative.
              </li>
              <li>
                <strong>No taxes or fees:</strong> The tool does not account for capital gains taxes,
                income taxes, fund expense ratios, or trading costs.
              </li>
              <li>
                <strong>Simplified inflation:</strong> Spending is adjusted once per year based on
                trailing CPI, not continuously.
              </li>
              <li>
                <strong>Past ≠ future:</strong> Historical data cannot predict future market
                conditions. Events without historical precedent (novel crises, structural economic
                changes) are not captured.
              </li>
              <li>
                <strong>Single asset class:</strong> Each scenario assumes 100% allocation to a
                single index. Real portfolios are typically diversified across asset classes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">Open Source</h2>
            <p>
              This project is open source. You can view the code, report issues, or contribute on{' '}
              <a href="https://github.com/georgie-ai/fire-calc" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
            <p>
              For questions, feedback, or bug reports, please open an issue on our{' '}
              <a href="https://github.com/georgie-ai/fire-calc/issues" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                GitHub repository
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
