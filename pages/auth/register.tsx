// pages/auth/register.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [role, setRole] = useState('artist');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }, // Save role as user metadata
      },
    });
  
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
  
    const user = data.user;
  
    if (user) {
      // 👇 Insert into profiles
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          email: user.email,
        },
      ]);
  
      if (insertError) {
        console.error('Error inserting into profiles:', insertError);
      }
    }
  
    router.push('/auth/login');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form className="space-y-4" onSubmit={handleRegister}>
        <input
          className="border p-2 w-64"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 w-64"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select
          className="border p-2 w-64"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="artist">Artist</option>
          <option value="customer">Customer</option>
        </select>
        <button className="bg-black text-white py-2 px-4" type="submit">
          Sign Up
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}
