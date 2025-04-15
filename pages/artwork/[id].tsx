// pages/artwork/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';

interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  style?: string;
  artist_id: string;
}

export default function ArtworkDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [artwork, setArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchArtwork = async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', id)
        .single();

      if (!error) setArtwork(data);
    };

    fetchArtwork();
  }, [id]);

  if (!artwork) {
    return (
      <>
        <Navbar />
        <div className="p-8 text-black">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-8 bg-white text-black max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="aspect-square overflow-hidden mb-4 border">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${artwork.image_url}`}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">{artwork.title}</h1>
          <p className="mb-4 text-gray-700">{artwork.description}</p>
          <p className="text-lg font-medium mb-2">Style: {artwork.style}</p>
          <p className="text-lg font-semibold mb-4">Price: £{artwork.price}</p>
          <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
            Buy Now
          </button>
        </div>
      </div>
    </>
  );
}
