// pages/profile/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type Profile = {
  id: string;
  email: string;
  avatar_url?: string;
  bio?: string;
};

type Artwork = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  style?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchProfileAndArt = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, email, avatar_url, bio')
        .eq('id', id)
        .single();

      const { data: artworkData } = await supabase
        .from('artworks')
        .select('*')
        .eq('artist_id', id)
        .order('created_at', { ascending: false });

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
          <h1 className="text-3xl font-bold">{profile.email}</h1>
          {profile.bio && <p className="text-gray-600 mt-2">{profile.bio}</p>}
        </div>

        <h2 className="text-2xl font-semibold mb-4">Artwork by {profile.email}</h2>

        {artworks.length === 0 ? (
          <p>No artwork posted yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {artworks.map((art) => (
              <Link
                key={art.id}
                href={`/artwork/${art.id}`}
                className="border p-4 rounded hover:shadow transition"
              >
                <div className="w-full aspect-square overflow-hidden mb-4 border">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${art.image_url}`}
                    alt={art.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold">{art.title}</h3>
                <p className="text-sm text-gray-600">{art.description}</p>
                <p className="text-sm font-medium mt-1">£{art.price}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
