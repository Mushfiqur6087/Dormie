'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Provost({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-red-800 text-white flex flex-col p-4">
        <div className="text-2xl font-bold mb-8">
          My Services
        </div>
        <nav className="flex flex-col space-y-4">
          <Link href="/">
            <button className={`w-full text-left p-2 rounded ${pathname === '/' ? 'bg-red-600' : 'hover:bg-red-700'}`}>
              My Information
            </button>
          </Link>
          <Link href="/">
            <button className={`w-full text-left p-2 rounded ${pathname === '/' ? 'bg-red-600' : 'hover:bg-red-700'}`}>
              Update Information
            </button>
          </Link>
            <Link href="/">
            <button className={`w-full text-left p-2 rounded ${pathname === '/' ? 'bg-red-600' : 'hover:bg-red-700'}`}>
              Show All Students
            </button>
          </Link>
          <Link href="/authoritycorner/provost/applications">
            <button className={`w-full text-left p-2 rounded ${pathname === '/' ? 'bg-red-600' : 'hover:bg-red-700'}`}>
              Show Application List
            </button>
          </Link>
            
            <Link href="/authoritycorner/provost/sethallfees">
            <button className={`w-full text-left p-2 rounded ${pathname === '/' ? 'bg-red-600' : 'hover:bg-red-700'}`}>
              Set Hall Fees
            </button>
          </Link>

            <Link href="/authoritycorner/provost/setdiningfees">
            <button className={`w-full text-left p-2 rounded ${pathname === '/' ? 'bg-red-600' : 'hover:bg-red-700'}`}>
              Set Dining Fee       
            </button>  
            </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
