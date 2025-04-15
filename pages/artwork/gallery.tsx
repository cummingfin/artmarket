// pages/artwork/gallery.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';

type Artwork = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  style?: string;
};

export default function Gallery() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filtered, setFiltered] = useState<Artwork[]>([]);
  const [priceFilter, setPriceFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');

  useEffect(() => {
    const fetchArtworks = async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Fetched artworks:', data);

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

  return (
    <>
      <Navbar />

      <div className="min-h-screen p-8 bg-white text-black">
        <h1 className="text-3xl font-bold mb-6">Explore Original Artwork</h1>

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

        {filtered.length === 0 ? (
          <p>No artwork matches your filters.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((art) => (
              <Link
                href={`/artwork/${art.id}`}
                key={art.id}
                className="block border p-4 rounded hover:shadow transition"
              >
                <div className="relative w-full aspect-square mb-4 border">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${art.image_url}`}
                    alt={art.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h2 className="text-xl font-semibold mb-1">{art.title}</h2>
                <p className="text-sm text-gray-700 mb-2">{art.description}</p>
                <p className="text-sm font-medium">Style: {art.style}</p>
                <p className="text-sm font-medium mb-2">Price: £{art.price}</p>
                <div className="bg-black text-white text-center py-2 rounded mt-2">
                  Buy Now
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
