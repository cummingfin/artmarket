import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  style?: string;
  profiles?: {
    id: string;
    username: string;
  };
}

export default function Gallery() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filtered, setFiltered] = useState<Artwork[]>([]);
  const [priceFilter, setPriceFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');

  useEffect(() => {
    const fetchArtworks = async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('*, profiles ( id, username )')
        .order('created_at', { ascending: false });

      if (!error) {
        setArtworks(data || []);
        setFiltered(data || []);
      }
    };

    fetchArtworks();
  }, []);

  useEffect(() => {
    let filteredData = [...artworks];

    if (priceFilter === 'under50') {
      filteredData = filteredData.filter((art) => art.price < 50);
    } else if (priceFilter === '50to100') {
      filteredData = filteredData.filter((art) => art.price >= 50 && art.price <= 100);
    } else if (priceFilter === 'over100') {
      filteredData = filteredData.filter((art) => art.price > 100);
    }

    if (styleFilter !== 'all') {
      filteredData = filteredData.filter((art) => art.style === styleFilter);
    }

    setFiltered(filteredData);
  }, [priceFilter, styleFilter, artworks]);

  const handleBuy = async (title: string, price: number) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, price }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen p-8 bg-white text-black">
        <h1 className="text-3xl font-bold mb-6">Explore Original Artwork</h1>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select className="border p-2" onChange={(e) => setPriceFilter(e.target.value)} value={priceFilter}>
            <option value="all">All Prices</option>
            <option value="under50">Under £50</option>
            <option value="50to100">£50 - £100</option>
            <option value="over100">Over £100</option>
          </select>

          <select className="border p-2" onChange={(e) => setStyleFilter(e.target.value)} value={styleFilter}>
            <option value="all">All Styles</option>
            <option value="abstract">Abstract</option>
            <option value="realism">Realism</option>
            <option value="minimalist">Minimalist</option>
            <option value="popart">Pop Art</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Artwork Grid */}
        {filtered.length === 0 ? (
          <p>No artwork matches your filters.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((art) => (
              <div key={art.id} className="border p-4 rounded">
                {/* Image links to artwork page */}
                <Link href={`/artwork/${art.id}`}>
                  <a>
                    <div className="w-full aspect-square overflow-hidden mb-4 border cursor-pointer">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${art.image_url}`}
                        alt={art.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </a>
                </Link>

                {/* Title links to artwork page */}
                <Link href={`/artwork/${art.id}`}>
                  <a>
                    <h2 className="text-xl font-semibold mb-1 hover:underline cursor-pointer">{art.title}</h2>
                  </a>
                </Link>

                <p className="text-sm text-gray-700 mb-1">{art.description}</p>

                {/* Artist profile link (with username) */}
                {art.profiles?.username && (
                  <p className="text-sm text-gray-500 mb-1">
                    by{' '}
                    <Link href={`/profile/${art.profiles.id}`}>
                      <a className="underline hover:text-black">{art.profiles.username}</a>
                    </Link>
                  </p>
                )}

                <p className="text-sm font-medium">Style: {art.style}</p>
                <p className="text-sm font-medium mb-2">Price: £{art.price}</p>

                <button
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 mt-2"
                  onClick={() => handleBuy(art.title, art.price)}
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
