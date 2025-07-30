'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isActive = (path) => pathname === path ? "underline" : "";

  return (
    <header className="bg-green-700 text-white px-6 py-4 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold" style={{ textAlign: 'center' }}>BUET Hall</h1>
        <nav className="space-x-4 text-lg">
          <Link href="/" className={isActive('/')}>Home</Link>
          <Link href="/about" className={isActive('/about')}>About</Link>
          <Link href="/contact" className={isActive('/contact')}>Contact</Link>
          <Link href="/login" className={isActive('/login')}>Login</Link>
          <Link href="/signup" className={isActive('/signup')}>Sign Up</Link>
        </nav>
      </div>
    </header>
  );
}
