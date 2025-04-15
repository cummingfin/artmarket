// pages/artwork/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Artwork = {
  id: string;
  title: string;
  description: string;
  price: number;
  style?: string;
  image_url: string;
};

export default function ArtworkDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [art, setArt] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchArtwork = async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', id)
        .single();

      if (!error) setArt(data);
      setLoading(false);
    };

    fetchArtwork();
  }, [id]);

  const handleBuy = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: art?.title, price: art?.price }),
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  if (loading) return <p className="p-6">Loading artwork...</p>;
  if (!art) return <p className="p-6">Artwork not found.</p>;

  return (
    <div className="min-h-screen p-8 bg-white text-black">
      <div className="max-w-4xl mx-auto">
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${art.image_url}`}
          alt={art.title}
          className="w-full max-h-[500px] object-contain border mb-6"
        />
        <h1 className="text-3xl font-bold mb-2">{art.title}</h1>
        <p className="text-gray-700 mb-4">{art.description}</p>
        <p className="text-sm font-medium">Style: {art.style}</p>
        <p className="text-xl font-semibold mb-6">£{art.price}</p>
        <button className="bg-black text-white px-6 py-2" onClick={handleBuy}>
          Buy Now
        </button>
      </div>
    </div>
  );
}
