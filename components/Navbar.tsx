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

  // Optional: For random colour fill on flower
  const [randomColor, setRandomColor] = useState('#000');

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const palette = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#F4A261'];
    setRandomColor(palette[Math.floor(Math.random() * palette.length)]);
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
    <nav className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b bg-white text-black shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 text-xl font-bold mb-2 md:mb-0">
        <Link href="/" className="flex items-center gap-2">
          {/* 🪷 Insert your inline SVG logo here */}
          
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 543.84 87.09">
  <g id="Logo">
    <rect id="Frame" x="1.5" y="1.5" width="60.44" height="83.81" fill="#fff" stroke="#231f20" stroke-linejoin="round" stroke-width="3"/>
    <path id="Stem" d="M27.09,85.61s5.03-21.61,3.57-43.22" fill="none" stroke="#231f20" stroke-linejoin="round" stroke-width="3"/>
    <g id="Petals">
      <path id="Fill" d="M23.41,33.2s-9.55-7.83.28-14.12c10.28-6.57,10.69,9.7,10.69,9.7,0,0,10.96-10.24,15.75-.84,4.79,9.41-11.35,10.52-11.35,10.52,0,0,10.79,11.38-.18,14.15s-10.72-9.47-10.72-9.47c0,0-8.51,9.59-13.04,3.81-4.53-5.78-5.3-13.91,8.57-13.75Z" fill="#8099ce"/>
      <path id="Outline" d="M23.26,33.01s-9.55-7.83.28-14.12c10.28-6.57,10.69,9.7,10.69,9.7,0,0,10.96-10.24,15.75-.84,4.79,9.41-11.35,10.52-11.35,10.52,0,0,10.79,11.38-.18,14.15s-10.72-9.47-10.72-9.47c0,0-8.51,9.59-13.04,3.81-4.53-5.78-5.3-13.91,8.57-13.75Z" fill="none" stroke="#231f20" stroke-linejoin="round" stroke-width="3"/>
    </g>
    <path id="Centre" d="M35.45,34.67c.5,2.37-2.12,4.45-3.38,5.21-2.08,1.25-4.27-1.39-5.21-3.38-1.03-2.19,1.27-5.25,3.38-5.21,1.89.04,4.76,1.27,5.21,3.38Z" fill="#fff" stroke="#231f20" stroke-linejoin="round" stroke-width="3"/>
  </g>
  <g id="Text">
    <path id="e-fill" d="M472.49,47.99c2.17,2.07,3.25,4.8,3.25,8.2h-24.84c.25-1.51.63-2.87,1.14-4.1,1-2.4,2.49-4.2,4.45-5.4,1.97-1.2,4.39-1.8,7.25-1.8,3.67,0,6.59,1.03,8.75,3.1Z" fill="#8099ce"/>
    <g id="re">
      <path d="M98.5,36.69c-.63-.07-1.32-.1-2.05-.1-3.67,0-6.82.95-9.45,2.85-2.19,1.58-3.71,3.6-4.53,6.04l-.42-7.69h-4.3v48h4.6v-29.2c0-4.53,1.33-8.25,4-11.15,2.67-2.9,6.23-4.35,10.7-4.35h3.6v-4c-.8-.2-1.52-.33-2.15-.4Z" fill="#231f20"/>
      <path d="M142.25,58.69c0-4.4-.88-8.25-2.65-11.55-1.77-3.3-4.23-5.88-7.4-7.75-3.17-1.87-6.85-2.8-11.05-2.8-4.47,0-8.38,1.07-11.75,3.2-3.37,2.13-6,5.1-7.9,8.9-1.9,3.8-2.85,8.2-2.85,13.2s.97,9.38,2.9,13.15c1.93,3.77,4.63,6.7,8.1,8.8,3.47,2.1,7.5,3.15,12.1,3.15,5.4,0,9.82-1.27,13.25-3.8,3.43-2.53,5.85-6.27,7.25-11.2h-4.7c-.93,3.53-2.73,6.22-5.4,8.05s-6.13,2.75-10.4,2.75c-5.8,0-10.33-1.93-13.6-5.8-3.11-3.68-4.74-8.71-4.88-15.1h38.98v-3.2ZM103.38,58.09c.27-2.86.98-5.45,2.12-7.75,1.5-3.03,3.6-5.38,6.3-7.05s5.82-2.5,9.35-2.5c4.93,0,8.9,1.58,11.9,4.75s4.5,7.35,4.5,12.55h-34.17Z" fill="#231f20"/>
    </g>
    <g id="canvased">
      <path d="M476.74,69.79c-.66,2.33-2.08,4.13-4.25,5.4-2.16,1.27-4.91,1.9-8.25,1.9-4.53,0-7.95-1.37-10.25-4.1-1.83-2.18-2.94-5.18-3.31-9.01l37.16-.09v-3.7c0-5.2-.98-9.67-2.95-13.4-1.53-2.91-3.57-5.33-6.1-7.24-.71-.55-1.46-1.05-2.25-1.51-3.6-2.1-7.9-3.15-12.9-3.15s-9.06,1.12-12.8,3.35c-2.53,1.51-4.68,3.42-6.45,5.72-.83,1.09-1.59,2.26-2.25,3.53-2.06,3.93-3.1,8.47-3.1,13.6s1.07,9.55,3.2,13.45c2.14,3.9,5.09,6.97,8.85,9.2,3.77,2.23,8.09,3.35,12.95,3.35,6.47,0,11.82-1.53,16.05-4.6,4.24-3.07,6.89-7.3,7.95-12.7h-11.3ZM452.04,52.09c1-2.4,2.49-4.2,4.45-5.4,1.97-1.2,4.39-1.8,7.25-1.8,3.67,0,6.59,1.03,8.75,3.1,2.17,2.07,3.25,4.8,3.25,8.2h-24.84c.25-1.51.63-2.87,1.14-4.1Z" fill="#231f20"/>
      <path d="M182.15,67.69c-.67,2.73-2.02,4.83-4.05,6.3-2.04,1.47-4.59,2.2-7.65,2.2-2.6,0-4.85-.62-6.75-1.85-1.9-1.23-3.35-2.98-4.35-5.25-1-2.27-1.5-4.97-1.5-8.1s.53-5.83,1.6-8.1c1.06-2.27,2.58-4.02,4.55-5.25,1.97-1.23,4.21-1.85,6.75-1.85,2.93,0,5.38.72,7.35,2.15,1.96,1.43,3.32,3.55,4.05,6.35h12.2c-.67-5.93-3.15-10.65-7.45-14.15-4.3-3.5-9.82-5.25-16.55-5.25-4.87,0-9.15,1.12-12.85,3.35s-6.6,5.32-8.7,9.25-3.15,8.43-3.15,13.5,1.02,9.85,3.05,13.75c2.03,3.9,4.91,6.93,8.65,9.1,3.73,2.17,8.1,3.25,13.1,3.25,4.33,0,8.2-.82,11.6-2.45s6.18-3.9,8.35-6.8c2.16-2.9,3.52-6.28,4.05-10.15h-12.3Z" fill="#231f20"/>
      <path d="M238.75,44.24c-1.74-3.1-4.2-5.43-7.4-7s-7.04-2.35-11.5-2.35-8.29.73-11.65,2.2c-3.37,1.47-5.97,3.52-7.8,6.15-1.84,2.63-2.75,5.75-2.75,9.35h10.4c0-2.6.96-4.62,2.9-6.05,1.93-1.43,4.7-2.15,8.3-2.15,2.06,0,3.86.32,5.4.95,1.53.63,2.71,1.63,3.55,3,.83,1.37,1.25,3.18,1.25,5.45v1.1l-14.8,1.2c-5.87.47-10.39,2.05-13.55,4.75-3.17,2.7-4.75,6.32-4.75,10.85s1.51,8.32,4.55,11.15c3.03,2.83,7.15,4.25,12.35,4.25,3.86,0,7.31-.8,10.35-2.4,3.03-1.6,5.08-3.67,6.15-6.2l.9,7.3h10.7v-30c0-4.6-.87-8.45-2.6-11.55ZM229.55,65.79c0,3.8-1.12,6.77-3.35,8.9-2.24,2.13-5.25,3.2-9.05,3.2-2.67,0-4.74-.57-6.2-1.7-1.47-1.13-2.2-2.8-2.2-5,0-2,.8-3.62,2.4-4.85,1.6-1.23,4.3-2.02,8.1-2.35l10.3-.8v2.6Z" fill="#231f20"/>
      <path d="M289.5,40.39c-3.17-3.67-7.85-5.5-14.05-5.5-3.34,0-6.42.7-9.25,2.1-2.84,1.4-5.02,3.33-6.55,5.8l-1-6.4h-11.3v49.4h12.2v-26.6c0-4,1.06-7.2,3.2-9.6,2.13-2.4,5.1-3.6,8.9-3.6,3.2,0,5.73,1.02,7.6,3.05,1.86,2.03,2.8,5.12,2.8,9.25v27.5h12.2v-30.4c0-6.33-1.59-11.33-4.75-15Z" fill="#231f20"/>
      <path d="M334.25,36.39l-9,22.7c-1.07,2.73-2.02,5.32-2.85,7.75-.84,2.43-1.42,4.42-1.75,5.95-.34-1.33-.89-3.22-1.65-5.65-.77-2.43-1.69-5.12-2.75-8.05l-8.6-22.7h-13l19.6,49.4h12l20.6-49.4h-12.6Z" fill="#231f20"/>
      <path d="M388.05,44.24c-1.74-3.1-4.21-5.43-7.41-7-3.19-1.57-7.03-2.35-11.5-2.35s-8.28.73-11.64,2.2c-3.37,1.47-5.97,3.52-7.8,6.15-1.84,2.63-2.75,5.75-2.75,9.35h10.39c0-2.6.97-4.62,2.91-6.05,1.93-1.43,4.7-2.15,8.3-2.15,2.06,0,3.86.32,5.4.95,1.53.63,2.71,1.63,3.55,3,.83,1.37,1.25,3.18,1.25,5.45v1.1l-14.8,1.2c-5.87.47-10.39,2.05-13.56,4.75-3.16,2.7-4.75,6.32-4.75,10.85s1.52,8.32,4.56,11.15c3.03,2.83,7.14,4.25,12.35,4.25,3.86,0,7.31-.8,10.34-2.4,3.04-1.6,5.09-3.67,6.16-6.2l.9,7.3h10.69v-30c0-4.6-.86-8.45-2.59-11.55ZM378.84,65.79c0,3.8-1.11,6.77-3.34,8.9-2.24,2.13-5.25,3.2-9.05,3.2-2.67,0-4.74-.57-6.2-1.7-1.47-1.13-2.2-2.8-2.2-5,0-2,.79-3.62,2.4-4.85,1.6-1.23,4.3-2.02,8.1-2.35l10.29-.8v2.6Z" fill="#231f20"/>
      <path d="M432.5,62.09c-2.11-2.07-5.22-3.57-9.36-4.5l-8.89-2.1c-4.27-1-6.41-2.87-6.41-5.6,0-1.8.67-3.23,2-4.3,1.34-1.07,3.21-1.6,5.6-1.6s4.27.62,5.61,1.85c1.33,1.23,2,2.92,2,5.05h11.59c-.06-3.2-.88-6-2.45-8.4-1.56-2.4-3.75-4.27-6.55-5.6-2.8-1.33-6.03-2-9.7-2s-7.16.62-10.1,1.85c-2.93,1.23-5.25,3.02-6.95,5.35-1.7,2.33-2.55,5.1-2.55,8.3,0,3.93,1.09,7.02,3.25,9.25,2.17,2.23,5.49,3.85,9.96,4.85l8.89,2.1c2.2.47,3.7,1.17,4.5,2.1.81.93,1.2,2,1.2,3.2,0,1.8-.75,3.23-2.25,4.3s-3.71,1.6-6.64,1.6c-2.74,0-4.87-.63-6.41-1.9-1.53-1.27-2.33-2.97-2.4-5.1h-11.6c0,4.87,1.82,8.8,5.46,11.8,3.63,3,8.51,4.5,14.64,4.5,4.07,0,7.67-.65,10.81-1.95,3.13-1.3,5.56-3.17,7.3-5.6,1.73-2.43,2.59-5.32,2.59-8.65,0-3.8-1.05-6.73-3.14-8.8Z" fill="#231f20"/>
      <path d="M531.74,11.39v31.3c-1.53-2.47-3.73-4.38-6.6-5.75-2.86-1.37-6.03-2.05-9.5-2.05-4.93,0-9.2,1.13-12.8,3.4-3.6,2.27-6.35,5.38-8.25,9.35-1.9,3.97-2.85,8.52-2.85,13.65s.95,9.63,2.85,13.5,4.57,6.88,8,9.05c3.44,2.17,7.55,3.25,12.35,3.25,3.74,0,7.12-.8,10.15-2.4,3.04-1.6,5.29-3.8,6.75-6.6l.8,7.7h11.2V11.39h-12.1ZM529.89,68.74c-1.16,2.3-2.78,4.07-4.85,5.3-2.06,1.23-4.53,1.85-7.4,1.85s-5.23-.63-7.3-1.9c-2.06-1.27-3.65-3.03-4.75-5.3-1.1-2.27-1.65-4.87-1.65-7.8s.55-5.53,1.65-7.8c1.1-2.27,2.69-4.05,4.75-5.35,2.07-1.3,4.5-1.95,7.3-1.95s5.34.65,7.4,1.95c2.07,1.3,3.69,3.07,4.85,5.3,1.17,2.23,1.75,4.85,1.75,7.85s-.58,5.55-1.75,7.85Z" fill="#231f20"/>
    </g>
  </g>
</svg>
          <span className="sr-only">Home</span>
        </Link>
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
            className="border border-gray-300 text-black p-2 rounded w-64"
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
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow text-sm z-10">
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
