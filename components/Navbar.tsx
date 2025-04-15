// components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-white text-black">
      {/* Logo */}
      <div className="text-xl font-bold">
        <Link href="/">art.market</Link>
      </div>

      {/* Search */}
      <div className="flex-1 mx-6">
        <input
          type="text"
          placeholder="Search artwork..."
          className="border p-2 w-full rounded"
        />
      </div>

      {/* Auth buttons */}
      <div className="space-x-4">
        <Link href="/auth/login" className="text-sm hover:underline">
          Log In
        </Link>
        <Link href="/auth/register" className="text-sm bg-black text-white px-4 py-1 rounded hover:bg-gray-900">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
