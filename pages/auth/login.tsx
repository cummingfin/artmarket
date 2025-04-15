// pages/auth/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (loginError) {
      setError(loginError.message);
    } else {
      router.push('/'); // ✅ Redirect to homepage after login
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black px-4">
      <div className="w-full max-w-md space-y-6 border p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-center">Log In</h2>

        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            className="border p-2 w-full"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="border p-2 w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            className="bg-black text-white w-full py-2 rounded hover:bg-gray-900"
            type="submit"
          >
            Log In
          </button>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </form>

        <div className="text-center">
            <p className="text-sm">
                {"Don't have an account? "}
                <Link href="/auth/register" className="text-blue-600 hover:underline">
                    Sign up instead
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}
