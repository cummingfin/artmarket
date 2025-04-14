// pages/dashboard/admin.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Artwork = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  style?: string;
};

export default function AdminDashboard() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchArtworks = async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('status', 'pending');

      if (!error) setArtworks(data || []);
    };

    fetchArtworks();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('artworks')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setMessage(`Artwork ${status}`);
      setArtworks((prev) => prev.filter((art) => art.id !== id));
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white text-black">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      {artworks.length === 0 ? (
        <p>No pending artwork to review.</p>
      ) : (
        <div className="space-y-6">
          {artworks.map((art) => (
            <div key={art.id} className="border p-4 rounded">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${art.image_url}`}
                alt={art.title}
                className="w-64 h-auto mb-4 border"
              />
              <h2 className="text-xl font-semibold">{art.title}</h2>
              <p className="text-sm text-gray-700 mb-2">{art.description}</p>
              <p className="text-sm font-medium">Style: {art.style}</p>
              <p className="text-sm font-medium">Price: £{art.price}</p>
              <div className="mt-4 space-x-4">
                <button
                  className="bg-green-600 text-white px-4 py-1"
                  onClick={() => handleAction(art.id, 'approved')}
                >
                  Approve
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-1"
                  onClick={() => handleAction(art.id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
