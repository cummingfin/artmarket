import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const loadInbox = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 1. Fetch all messages
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (messageError || !messageData) {
        console.error('Failed to load messages:', messageError?.message);
        setLoading(false);
        return;
      }

      // 2. Fetch all artworks involved
      const artworkIds = Array.from(new Set(messageData.map(m => m.artwork_id)));
      const { data: artworks } = await supabase
        .from('artworks')
        .select('id, title, artist_id')
        .in('id', artworkIds);

      const artworkMap = new Map(artworks?.map(a => [a.id, a]) ?? []);

      // 3. Filter messages relevant to user (as sender or artist)
      const relevantMessages = messageData.filter(msg => {
        const artwork = artworkMap.get(msg.artwork_id);
        return msg.sender_id === user.id || artwork?.artist_id === user.id;
      });

      // 4. Collect unique user IDs for profile lookup
      const userIds = Array.from(
        new Set(relevantMessages.flatMap(m => [m.sender_id, m.receiver_id]))
      );

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.username]) ?? []);

      // 5. Group messages into threads
      const threadMap = new Map<string, Thread>();

      for (const msg of relevantMessages) {
        const artwork = artworkMap.get(msg.artwork_id);
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const key = `${msg.artwork_id}_${otherUserId}`;

        if (!threadMap.has(key)) {
          threadMap.set(key, {
            artwork_id: msg.artwork_id,
            buyer_id: otherUserId,
            latest_message: msg.content,
            updated_at: msg.created_at,
            artwork_title: artwork?.title ?? 'Untitled',
            buyer_username: profileMap.get(otherUserId) ?? 'Unknown',
          });
        }
      }

      setThreads(Array.from(threadMap.values()));
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
