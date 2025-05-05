import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type Thread = {
  artwork_id: string;
  buyer_id: string;
  latest_message: string;
  updated_at: string;
  artwork_title: string;
  buyer_username: string;
};

export default function Inbox() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadInbox = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch messages where current user is artist or buyer
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          message,
          created_at,
          buyer_id,
          sender_id,
          artwork_id,
          profiles!buyer_id (username),
          artworks ( title, artist_id )
        `)
        .or(`sender_id.eq.${user.id},artworks.artist_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load messages:', error.message);
        return;
      }

      // Group by artwork_id + buyer_id
      const map = new Map<string, Thread>();
      data.forEach((msg: any) => {
        const key = `${msg.artwork_id}_${msg.buyer_id}`;
        if (!map.has(key)) {
          map.set(key, {
            artwork_id: msg.artwork_id,
            buyer_id: msg.buyer_id,
            latest_message: msg.message,
            updated_at: msg.created_at,
            artwork_title: msg.artworks?.title ?? 'Untitled',
            buyer_username: msg.profiles?.username ?? 'Unknown',
          });
        }
      });

      setThreads(Array.from(map.values()));
      setLoading(false);
    };

    loadInbox();
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-3xl mx-auto text-black">
        <h1 className="text-2xl font-bold mb-6">Inbox</h1>

        {loading ? (
          <p>Loading conversations...</p>
        ) : threads.length === 0 ? (
          <p>No conversations yet.</p>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link
                key={`${thread.artwork_id}_${thread.buyer_id}`}
                href={`/messages/${thread.artwork_id}/${thread.buyer_id}`}
                className="block border rounded-lg p-4 hover:shadow transition"
              >
                <h2 className="font-semibold text-lg mb-1">{thread.artwork_title}</h2>
                <p className="text-sm text-gray-600">
                  with <span className="font-medium">{thread.buyer_username}</span>
                </p>
                <p className="text-sm mt-1 text-gray-700 truncate">{thread.latest_message}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
