import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-white text-black">
      <h1 className="text-3xl font-bold mb-4">🎨 Welcome to ArtMarket</h1>
      <p className="mb-6 text-gray-600">Discover original art. Support emerging artists.</p>

      <div className="space-x-4">
        <Link href="/auth/register" className="bg-black text-white px-4 py-2 rounded">
          Sign Up
        </Link>
        <Link href="/auth/login" className="text-black underline">
          Log In
        </Link>
        <Link href="/artwork/gallery" className="text-black underline ml-4">
          View Gallery
        </Link>
      </div>
    </main>
  );
}
