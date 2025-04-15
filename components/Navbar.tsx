// components/Navbar.tsx
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import type { Session } from '@supabase/supabase-js';

export default function Navbar() {
  const [showSearch, setShowSearch] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();
  }, []);

  const handleSellClick = () => {
    if (session?.user) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <nav className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b bg-white text-black">
      {/* Logo */}
      <div className="text-xl font-bold mb-2 md:mb-0">
        <Link href="/">art.market</Link>
      </div>

      {/* Search toggle */}
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

      {/* Auth + Sell */}
      <div className="flex items-center gap-4">
        <button onClick={handleSellClick} className="text-sm hover:underline">
          Sell
        </button>

        {session?.user ? (
          <Link href="/dashboard" className="text-sm hover:underline">
            Dashboard
          </Link>
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
