import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm mb-6 inline-block">&larr; Back to Calculator</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 20, 2026</p>

        <div className="prose prose-gray prose-sm max-w-none space-y-6 text-gray-600">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Can I FIRE Yet? ("canifireyet.com", "the Site"), you accept and
              agree to be bound by these Terms of Service. If you do not agree to these terms, please
              do not use the Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. Description of Service</h2>
            <p>
              Can I FIRE Yet? is a free, web-based financial calculator designed for educational and
              informational purposes. The tool allows users to model retirement scenarios using
              historical market data, including S&P 500 and Nasdaq 100 index returns, consumer price
              index (CPI) data, and federal funds rate data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. Not Financial Advice</h2>
            <p>
              <strong>
                The information provided by this Site does not constitute investment advice, financial
                advice, tax advice, or any other form of professional advice.
              </strong>
            </p>
            <p>
              The calculations, projections, and analysis provided are based on historical data and
              simplified models. They do not account for all factors that affect real-world investment
              outcomes, including but not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Taxes (income, capital gains, estate)</li>
              <li>Investment fees, commissions, and expense ratios</li>
              <li>Dividend income (returns used are price returns only)</li>
              <li>Individual risk tolerance and financial circumstances</li>
              <li>Future market conditions that differ from historical patterns</li>
              <li>Healthcare costs, insurance, and unexpected expenses</li>
              <li>Social Security, pensions, or other income sources</li>
            </ul>
            <p>
              You should consult a qualified financial advisor before making any investment or
              retirement planning decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. No Warranties</h2>
            <p>
              The Site and its content are provided "as is" and "as available" without warranties of
              any kind, either express or implied, including but not limited to warranties of
              merchantability, fitness for a particular purpose, accuracy, or non-infringement.
            </p>
            <p>
              We do not warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The data used in calculations is accurate, complete, or current</li>
              <li>The calculations or projections are free from errors</li>
              <li>The Site will be available without interruption</li>
              <li>The results will be suitable for your specific financial situation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, we shall not be liable for any direct, indirect,
              incidental, special, consequential, or punitive damages arising from or related to your
              use of, or inability to use, the Site. This includes, without limitation, damages for
              loss of profits, data, or other intangible losses, even if we have been advised of the
              possibility of such damages.
            </p>
            <p>
              You acknowledge that any reliance on the information provided by this Site is at your
              own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Data Sources</h2>
            <p>
              Historical market data used in this calculator is sourced from publicly available
              databases including FRED (Federal Reserve Economic Data) and other financial data
              providers. While we strive for accuracy, we cannot guarantee the completeness or
              correctness of any data presented.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Site for any unlawful purpose</li>
              <li>Attempt to interfere with the proper functioning of the Site</li>
              <li>Scrape, crawl, or use automated means to access the Site in a manner that places undue burden on our infrastructure</li>
              <li>Misrepresent the Site's output as professional financial advice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">8. Intellectual Property</h2>
            <p>
              The Site's design, code, and original content are the property of the site owner. The
              underlying historical market data is sourced from public domain or publicly available
              datasets.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">9. Third-Party Content and Advertising</h2>
            <p>
              The Site may display advertisements provided by third-party advertising networks,
              including Google AdSense. We are not responsible for the content of any third-party
              advertisements or the products/services they promote. Interaction with any advertiser
              is solely between you and that advertiser.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will be
              effective immediately upon posting to the Site. Your continued use of the Site after
              any changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable laws,
              without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">12. Contact</h2>
            <p>
              Questions about these Terms of Service may be directed to us through our{' '}
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
