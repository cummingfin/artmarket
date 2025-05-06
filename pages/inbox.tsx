// pages/inbox.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type Thread = {
  artwork_id: string;
  other_user_id: string;
  latest_message: string;
  updated_at: string;
  artwork_title: string;
  other_username: string;
};

type SupabaseMessageRow = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  artwork_id: string;
  artworks: { title: string; artist_id: string }[];
  sender: { username: string }[];
  receiver: { username: string }[];
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
          content,
          created_at,
          sender_id,
          receiver_id,
          artwork_id,
          artworks ( title, artist_id ),
          sender:profiles!messages_sender_id_fkey ( username ),
          receiver:profiles!messages_receiver_id_fkey ( username )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load messages:', error.message);
        return;
      }

      const filtered = (data as SupabaseMessageRow[]).filter((msg) => {
        return (
          msg.sender_id === user.id ||
          msg.receiver_id === user.id ||
          msg.artworks?.[0]?.artist_id === user.id
        );
      });

      const map = new Map<string, Thread>();
      filtered.forEach((msg) => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const key = `${msg.artwork_id}_${otherUserId}`;
        if (!map.has(key)) {
          map.set(key, {
            artwork_id: msg.artwork_id,
            other_user_id: otherUserId,
            latest_message: msg.content,
            updated_at: msg.created_at,
            artwork_title: msg.artworks?.[0]?.title ?? 'Untitled',
            other_username:
              msg.sender_id === user.id
                ? msg.receiver?.[0]?.username ?? 'Unknown'
                : msg.sender?.[0]?.username ?? 'Unknown',
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
                key={`${thread.artwork_id}_${thread.other_user_id}`}
                href={`/messages/${thread.artwork_id}/${thread.other_user_id}`}
                className="block border rounded-lg p-4 hover:shadow transition"
              >
                <h2 className="font-semibold text-lg mb-1">{thread.artwork_title}</h2>
                <p className="text-sm text-gray-600">
                  with <span className="font-medium">{thread.other_username}</span>
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
