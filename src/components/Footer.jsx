import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Can I FIRE Yet? For educational purposes only.
          </p>
          <nav className="flex gap-6">
            <Link to="/about" className="text-xs text-gray-500 hover:text-gray-700">About</Link>
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-gray-700">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-700">Terms of Service</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
