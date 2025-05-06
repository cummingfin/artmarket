import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  sender?: { username: string }[];   // ✅ make it an array
  receiver?: { username: string }[];
  artworks?: { title: string; image_url: string }[];
};


type ArtworkInfo = {
  title: string;
  image_url: string;
};

export default function MessageThread() {
  const router = useRouter();
  const { artworkId, otherUserId } = router.query;

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [artwork, setArtwork] = useState<ArtworkInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: session } = await supabase.auth.getSession();
      const currentUser = session.session?.user.id;
      setUserId(currentUser || null);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          sender:sender_id (username)
        `)
        .or(`sender_id.eq.${currentUser},receiver_id.eq.${currentUser}`)
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: true });

      if (!error) {
        setMessages(data as Message[]);
      }

      const { data: artworkData } = await supabase
        .from('artworks')
        .select('title, image_url')
        .eq('id', artworkId)
        .single();

      setArtwork(artworkData);
    };

    if (artworkId && otherUserId) {
      fetchData();
    }
  }, [artworkId, otherUserId]);

  const handleSend = async () => {
    if (!userId || !content.trim()) return;

    const { error } = await supabase.from('messages').insert([
      {
        artwork_id: artworkId,
        sender_id: userId,
        receiver_id: otherUserId,
        content,
      },
    ]);

    if (!error) {
      setContent('');
      const { data } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          artwork_id,
          sender:sender_id (username),
          receiver:receiver_id (username),
          artworks (title, image_url)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: true });

      setMessages(data as Message[]);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 text-black bg-white min-h-screen">
        {artwork && (
          <div className="mb-6">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork/${artwork.image_url}`}
              alt={artwork.title}
              className="w-full rounded mb-2"
            />
            <h2 className="text-xl font-semibold">{artwork.title}</h2>
          </div>
        )}

        <div className="space-y-3 mb-4">
          {messages.map((msg) => {
            const isSender = msg.sender_id === userId;
            return (
              <div
                key={msg.id}
                className={`p-3 rounded max-w-[70%] ${
                  isSender
                    ? 'ml-auto bg-gray-200 text-right'
                    : 'mr-auto bg-blue-100 text-left'
                }`}
              >
                <p className="text-sm mb-1">{msg.content}</p>
                <p className="text-xs text-gray-500">
                  {msg.sender?.[0]?.username ?? 'Unknown'}
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mt-6">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 border p-2 rounded text-black"
            placeholder="Write a message..."
          />
          <button
            onClick={handleSend}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
