import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm mb-6 inline-block">&larr; Back to Calculator</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 20, 2026</p>

        <div className="prose prose-gray prose-sm max-w-none space-y-6 text-gray-600">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Introduction</h2>
            <p>
              Welcome to Can I FIRE Yet? ("canifireyet.com", "we", "us", or "our"). We respect your privacy
              and are committed to protecting any personal data that may be collected through your use of
              this website. This Privacy Policy explains what information we collect, how we use it, and
              your rights regarding that information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. Information We Collect</h2>
            <p>
              <strong>Data you enter into the calculator:</strong> All financial parameters you input
              (starting capital, spending amounts, dates, etc.) are processed entirely in your browser.
              We do not transmit, store, or have access to any of the financial data you enter.
            </p>
            <p>
              <strong>Automatically collected information:</strong> We may collect non-personally
              identifiable information through cookies and similar technologies, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referring website</li>
              <li>Pages visited and time spent</li>
              <li>Approximate geographic location (country/region level)</li>
              <li>Device type (desktop, mobile, tablet)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. How We Use Your Information</h2>
            <p>We use the automatically collected information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Understand how visitors use the site so we can improve it</li>
              <li>Analyze traffic patterns and site performance</li>
              <li>Serve relevant advertisements through Google AdSense</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Cookies and Advertising</h2>
            <p>
              This site uses cookies to enhance your experience and to serve personalized advertisements.
            </p>
            <p>
              <strong>Google AdSense:</strong> We use Google AdSense to display advertisements. Google
              and its partners may use cookies to serve ads based on your prior visits to this website
              or other websites. Google's use of advertising cookies enables it and its partners to
              serve ads based on your visit to this site and/or other sites on the Internet.
            </p>
            <p>
              You may opt out of personalized advertising by visiting{' '}
              <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Google Ads Settings
              </a>. Alternatively, you may opt out of third-party vendor cookies by visiting{' '}
              <a href="https://www.aboutads.info/choices/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                www.aboutads.info/choices
              </a>.
            </p>
            <p>
              <strong>Google Analytics:</strong> We may use Google Analytics to collect and analyze
              website traffic data. Google Analytics uses cookies to track user interactions. The
              information generated is transmitted to and stored by Google. You can opt out by installing
              the{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Google Analytics Opt-out Browser Add-on
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Third-Party Services</h2>
            <p>
              We may use the following third-party services that collect information on our behalf:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Google AdSense (advertising)</li>
              <li>Google Analytics (site analytics)</li>
              <li>GitHub Pages (hosting)</li>
            </ul>
            <p>
              Each of these services has its own privacy policy governing how they use your information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Data Retention</h2>
            <p>
              We do not store any personal data on our servers. All calculator inputs are processed
              locally in your browser. Analytics and advertising data is retained by the respective
              third-party providers according to their own data retention policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. Children's Privacy</h2>
            <p>
              This website is not intended for children under the age of 13. We do not knowingly
              collect personal information from children under 13. If you believe we have inadvertently
              collected such information, please contact us so we can promptly remove it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Opt out of personalized advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this
              page with an updated revision date. Your continued use of the site after any changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our{' '}
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
