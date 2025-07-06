export default function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white transition-colors">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Dorm-E</h3>
            <p className="text-gray-300 dark:text-gray-400">Smart Dormitory Management System for BUET students</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">
                  Login
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <p className="text-gray-300 dark:text-gray-400">
              BUET Campus
              <br />
              Dhaka, Bangladesh
              <br />
              Email: info@dorm-e.com
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 dark:border-gray-600 text-center">
          <p className="text-gray-300 dark:text-gray-400">© 2024 Dorm-E. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
