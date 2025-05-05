import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import BuyButton from '@/components/BuyButton';
import OfferModal from '@/components/OfferModal';

type Artwork = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  style?: string;
  sold?: boolean;
  shipping_cost?: number;
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
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchArtwork = async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('id, title, description, price, image_url, style, sold, shipping_cost, profiles ( id, username )')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        const formatted = {
          ...data,
          profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
        };
        setArtwork(formatted);
      } else {
        console.error('Error fetching artwork:', error?.message);
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
        <p className="font-semibold mb-1">Price: £{artwork.price}</p>
        {artwork.shipping_cost !== undefined && (
          <p className="text-sm text-gray-600 mb-6">
            + £{artwork.shipping_cost} shipping
          </p>
        )}

        {!artwork.sold ? (
          <>
            <BuyButton
              artwork={{
                id: artwork.id,
                title: artwork.title,
                price: artwork.price,
                shipping_cost: artwork.shipping_cost || 0,
              }}
            />
            <button
              onClick={() => setShowOfferModal(true)}
              className="mt-3 text-sm underline text-blue-600 hover:text-blue-800"
            >
              Make an Offer
            </button>
          </>
        ) : (
          <>
            <p className="text-red-500 font-semibold text-sm">Sold</p>
            <button
              disabled
              className="mt-2 text-sm underline text-gray-400 cursor-not-allowed"
            >
              Make an Offer
            </button>
          </>
        )}
      </div>

      {/* Offer Modal */}
      {artwork && (
        <OfferModal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          artistId={artwork.profiles?.id || ''}
          artworkId={artwork.id}
          artworkTitle={artwork.title}
          price={artwork.price}
        />
      )}
    </>
  );
}
