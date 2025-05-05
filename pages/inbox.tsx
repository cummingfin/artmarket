import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type Thread = {
  artwork_id: string;
  receiver_id: string;
  latest_message: string;
  updated_at: string;
  artwork_title: string;
  receiver_username: string;
};

type SupabaseMessageRow = {
  id: string;
  message: string;
  created_at: string;
  receiver_id: string;
  sender_id: string;
  artwork_id: string;
  profiles?: { username: string }[]; // ✅ array
  artworks?: { title: string; artist_id: string }[]; // ✅ array
};

export default function Inbox() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInbox = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          message,
          created_at,
          receiver_id,
          sender_id,
          artwork_id,
          profiles!receiver_id (username),
          artworks ( title, artist_id )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load messages:', error.message);
        return;
      }

      const filtered = (data as SupabaseMessageRow[]).filter((msg) => {
        return (
          msg.sender_id === user.id ||
          msg.artworks?.[0]?.artist_id === user.id
        );
      });

      const map = new Map<string, Thread>();
      filtered.forEach((msg) => {
        const key = `${msg.artwork_id}_${msg.receiver_id}`;
        if (!map.has(key)) {
          map.set(key, {
            artwork_id: msg.artwork_id,
            receiver_id: msg.receiver_id,
            latest_message: msg.message,
            updated_at: msg.created_at,
            artwork_title: msg.artworks?.[0]?.title ?? 'Untitled',
            receiver_username: msg.profiles?.[0]?.username ?? 'Unknown',
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
      <div className="p-6 max-w-3xl mx-auto text-black bg-white min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Inbox</h1>

        {loading ? (
          <p>Loading conversations...</p>
        ) : threads.length === 0 ? (
          <p>No conversations yet.</p>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link
                key={`${thread.artwork_id}_${thread.receiver_id}`}
                href={`/messages/${thread.artwork_id}/${thread.receiver_id}`}
                className="block border rounded-lg p-4 hover:shadow transition"
              >
                <h2 className="font-semibold text-lg mb-1">{thread.artwork_title}</h2>
                <p className="text-sm text-gray-600">
                  with <span className="font-medium">{thread.receiver_username}</span>
                </p>
                <p className="text-sm mt-1 text-gray-700 truncate">
                  {thread.latest_message}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
