// components/Navbar.tsx
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import type { Session } from '@supabase/supabase-js';

export default function Navbar() {
  const [showSearch, setShowSearch] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSellClick = () => {
    if (session?.user) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.push('/');
  };

  return (
    <nav className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b bg-white text-black">
      {/* Logo */}
      <div className="text-xl font-bold mb-2 md:mb-0">
        <Link href="/">art.market</Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-2 md:mb-0">
        <button
          onClick={() => setShowSearch((prev) => !prev)}
          className="text-sm hover:underline"
        >
          Search
        </button>

        {showSearch && (
          <input
            type="text"
            placeholder="Search artwork..."
            className="border p-2 rounded w-64"
          />
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4 relative">
        <button onClick={handleSellClick} className="text-sm hover:underline">
          Sell
        </button>

        {session?.user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="text-sm hover:underline"
            >
              Profile
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow text-sm z-10">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => router.push('/profile')}
                >
                  Edit Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => router.push('/orders')}
                >
                  Orders
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => router.push('/sold')}
                >
                  Sold Artwork
                </button>
                <hr />
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/auth/login" className="text-sm hover:underline">
              Log In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm bg-black text-white px-4 py-1 rounded hover:bg-gray-900"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
