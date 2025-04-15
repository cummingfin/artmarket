import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }, // Save username to metadata
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    console.log('✅ Registered user:', data.user);

    // ⏳ Wait for session (in case user confirms email immediately)
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      console.warn('⏳ No session yet — waiting for email confirmation.');
      return router.push('/auth/login');
    }

    const { error: insertError } = await supabase.from('profiles').insert([
      {
        id: user.id,
        email: user.email,
        username: username,
      },
    ]);

    if (insertError) {
      console.error('❌ Error inserting into profiles:', insertError);
    } else {
      console.log('✅ Profile inserted successfully');
    }

    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black px-4">
      <div className="w-full max-w-md space-y-6 border p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-center">Register</h2>

        <form className="space-y-4" onSubmit={handleRegister}>
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
          <input
            className="border p-2 w-full"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <button className="bg-black text-white w-full py-2 rounded hover:bg-gray-900" type="submit">
            Sign Up
          </button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>

        <div className="text-center">
          <p className="text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
