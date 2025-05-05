import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import BuyButton from '@/components/BuyButton';
import OfferModal from '@/components/OfferModal';

interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
}

interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  style?: string;
  sold?: boolean;
  shipping_cost?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProfileAndArt = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .eq('id', id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      const { data: artworkData, error: artworkError } = await supabase
        .from('artworks')
        .select('id, title, description, price, image_url, style, sold, shipping_cost')
        .eq('artist_id', id)
        .order('created_at', { ascending: false });

      if (artworkError) {
        console.error('Error fetching artworks:', artworkError);
      }

      setProfile(profileData);
      setArtworks(artworkData || []);
    };

    fetchProfileAndArt();
  }, [id]);

  if (!profile) return <p className="p-8">Loading profile...</p>;

  return (
    <>
      <Navbar />
      <div className="p-8 bg-white text-black">
        <div className="max-w-3xl mx-auto text-center mb-10">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
          )}
          <h1 className="text-3xl font-bold">{profile.username}</h1>
          {profile.bio && <p className="text-gray-600 mt-2">{profile.bio}</p>}
        </div>

        <h2 className="text-2xl font-semibold mb-4">Artwork by {profile.username}</h2>

        {artworks.length === 0 ? (
          <p>No artwork posted yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {artworks.map((art) => (
              <div key={art.id} className="border p-4 rounded hover:shadow transition">
                <Link href={`/artwork/${art.id}`}>
                  <div className="w-full aspect-square overflow-hidden mb-4 border cursor-pointer">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${art.image_url}`}
                      alt={art.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <h3 className="text-lg font-semibold">{art.title}</h3>
                <p className="text-sm text-gray-600">{art.description}</p>
                <p className="text-sm font-medium">Price: £{art.price}</p>
                {art.shipping_cost !== undefined && (
                  <p className="text-sm text-gray-500 mb-1">
                    + £{art.shipping_cost} shipping
                  </p>
                )}

                {!art.sold ? (
                  <>
                    <BuyButton
                      artwork={{
                        id: art.id,
                        title: art.title,
                        price: art.price,
                        shipping_cost: art.shipping_cost || 0,
                      }}
                    />
                    <button
                      onClick={() => {
                        setActiveArtwork(art);
                        setShowOfferModal(true);
                      }}
                      className="mt-2 text-sm underline text-blue-600 hover:text-blue-800"
                    >
                      Make an Offer
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-red-500 text-sm mt-2 font-semibold">Sold</p>
                    <button
                      disabled
                      className="mt-2 text-sm underline text-gray-400 cursor-not-allowed"
                    >
                      Make an Offer
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offer Modal */}
      {activeArtwork && (
        <OfferModal
          isOpen={showOfferModal}
          onClose={() => {
            setShowOfferModal(false);
            setActiveArtwork(null);
          }}
          artistId={id as string}
          artworkId={activeArtwork.id}
          artworkTitle={activeArtwork.title}
          price={activeArtwork.price}
        />
      )}
    </>
  );
}
