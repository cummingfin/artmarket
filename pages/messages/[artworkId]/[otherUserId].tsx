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
  senderUsername?: string;
};

type Artwork = {
  title: string;
  image_url: string;
};

export default function MessageThread() {
  const router = useRouter();
  const { artworkId, otherUserId } = router.query;

  const [messages, setMessages] = useState<Message[]>([]);
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const sessionRes = await supabase.auth.getSession();
      const currentUserId = sessionRes.data.session?.user.id || null;
      setUserId(currentUserId);

      if (!artworkId || !otherUserId || !currentUserId) return;

      // 1. Fetch messages
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(artwork_id.eq.${artworkId},sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(artwork_id.eq.${artworkId},sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (msgError || !msgData) {
        console.error('[DEBUG] Error fetching messages:', msgError?.message);
        return;
      }

      // 2. Fetch usernames
      const userIds = Array.from(new Set(msgData.flatMap(m => [m.sender_id, m.receiver_id])));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.username]));
      const enrichedMessages: Message[] = msgData.map((msg) => ({
        ...msg,
        senderUsername: profileMap.get(msg.sender_id) ?? 'Unknown',
      }));

      setMessages(enrichedMessages);

      // 3. Fetch artwork
      const { data: artworkData, error: artworkError } = await supabase
        .from('artworks')
        .select('title, image_url')
        .eq('id', artworkId)
        .maybeSingle();

      if (artworkError) {
        console.error('[DEBUG] Error fetching artwork:', artworkError.message);
      } else {
        setArtwork(artworkData);
      }
    };

    fetchData();
  }, [artworkId, otherUserId]);

  const handleSend = async () => {
    if (!userId || !content.trim() || !artworkId || !otherUserId) return;

    const { error } = await supabase.from('messages').insert([
      {
        artwork_id: artworkId,
        sender_id: userId,
        receiver_id: otherUserId,
        content,
      },
    ]);

    if (error) {
      console.error('[DEBUG] Error sending message:', error.message);
      return;
    }

    setContent('');

    // Trigger a refetch
    const fetchData = async () => {
      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .or(`and(artwork_id.eq.${artworkId},sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(artwork_id.eq.${artworkId},sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      const userIds = Array.from(new Set(msgData?.flatMap(m => [m.sender_id, m.receiver_id])));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.username]));
      const enrichedMessages: Message[] = msgData?.map((msg) => ({
        ...msg,
        senderUsername: profileMap.get(msg.sender_id) ?? 'Unknown',
      })) ?? [];

      setMessages(enrichedMessages);
    };

    fetchData();
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-4 text-black bg-white min-h-screen">
        {artwork && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{artwork.title}</h1>
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="w-full max-h-64 object-cover rounded mt-2"
            />
          </div>
        )}

        <div className="space-y-3 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded max-w-[70%] ${
                msg.sender_id === userId
                  ? 'ml-auto bg-gray-200 text-right'
                  : 'mr-auto bg-blue-100 text-left'
              }`}
            >
              <p className="text-sm mb-1 font-semibold">
                {msg.senderUsername}
              </p>
              <p>{msg.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
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
            disabled={!content.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
