import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import BuyButton from '@/components/BuyButton';

type Artwork = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  style?: string;
  sold?: boolean;
  artist_id?: string;
  profiles?: {
    id: string;
    username: string;
  };
};

export default function ArtworkDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [artwork, setArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchArtwork = async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('*, profiles ( id, username )')
        .eq('id', id)
        .maybeSingle();

      if (!error) {
        setArtwork(data);
      } else {
        console.error('Error fetching artwork:', error.message);
      }
    };

    fetchArtwork();
  }, [id]);

  if (!artwork) return <p className="p-8">Loading artwork...</p>;

  return (
    <>
      <Navbar />
      <div className="p-8 bg-white text-black max-w-3xl mx-auto">
        <div className="aspect-square w-full overflow-hidden mb-6 border">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${artwork.image_url}`}
            alt={artwork.title}
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="text-3xl font-bold mb-2">{artwork.title}</h1>
        <p className="text-gray-700 mb-2">{artwork.description}</p>

        {artwork.profiles && (
          <p className="text-sm text-gray-500 mb-2">
            by{' '}
            <Link
              href={`/profile/${artwork.profiles.id}`}
              className="underline hover:text-black"
            >
              {artwork.profiles.username}
            </Link>
          </p>
        )}

        <p className="font-semibold mb-2">Style: {artwork.style}</p>
        <p className="font-semibold mb-6 text-lg">Price: £{artwork.price}</p>

        {!artwork.sold ? (
          <BuyButton
            artwork={{ id: artwork.id, title: artwork.title, price: artwork.price }}
          />
        ) : (
          <p className="text-red-500 font-semibold text-sm">Sold</p>
        )}
      </div>
    </>
  );
}
