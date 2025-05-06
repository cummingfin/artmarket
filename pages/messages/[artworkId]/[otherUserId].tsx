// pages/messages/[artworkId]/[otherUserId].tsx
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
  sender: { username: string }[];
};

type Artwork = {
  title: string;
  image_url: string;
};

export default function MessageThread() {
  const router = useRouter();
  const { artworkId, otherUserId } = router.query;

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [artwork, setArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      console.log('[DEBUG] Fetching session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('[DEBUG] Session fetch error:', sessionError);
        return;
      }

      const currentUserId = sessionData.session?.user.id ?? null;
      setUserId(currentUserId);
      console.log('[DEBUG] Current user ID:', currentUserId);

      if (!artworkId || !otherUserId || !currentUserId) {
        console.warn('[DEBUG] Missing IDs', { artworkId, otherUserId, currentUserId });
        return;
      }

      console.log('[DEBUG] Fetching messages...');
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          sender:sender_id ( username )
        `)
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: true });

      if (messageError) {
        console.error('[DEBUG] Message fetch error:', messageError);
        return;
      }

      console.log('[DEBUG] Raw message data:', messageData);
      setMessages(messageData as any); // We keep `any` for now to log the full shape

      console.log('[DEBUG] Fetching artwork...');
      const { data: artworkData, error: artworkError } = await supabase
        .from('artworks')
        .select('title, image_url')
        .eq('id', artworkId)
        .single();

      if (artworkError) {
        console.error('[DEBUG] Artwork fetch error:', artworkError);
        return;
      }

      console.log('[DEBUG] Artwork info:', artworkData);
      setArtwork(artworkData);
    };

    loadMessages();
  }, [artworkId, otherUserId]);

  const handleSend = async () => {
    if (!userId || !content.trim()) return;

    console.log('[DEBUG] Sending message...');
    const messagePayload = {
      artwork_id: artworkId,
      sender_id: userId,
      receiver_id: otherUserId,
      content,
    };

    console.log('[DEBUG] Message payload:', messagePayload);

    const { error } = await supabase.from('messages').insert([messagePayload]);

    if (error) {
      console.error('[DEBUG] Message insert error:', error);
    } else {
      console.log('[DEBUG] Message sent successfully');
      setContent('');
      // Refetch messages
      const { data: updatedMessages, error: updatedError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          sender:sender_id ( username )
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: true });

      if (updatedError) {
        console.error('[DEBUG] Message refetch error:', updatedError);
      } else {
        console.log('[DEBUG] Updated message data:', updatedMessages);
        setMessages(updatedMessages as any);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 text-black bg-white min-h-screen">
        <h1 className="text-xl font-bold mb-4">
          Chat about: <i>{artwork?.title ?? 'Untitled'}</i>
        </h1>
        <p className="text-sm text-gray-600 mb-2">
          Talking with: <b>{messages.length > 0 ? messages[0]?.sender?.[0]?.username ?? 'Unknown' : 'Loading...'}</b>
        </p>
        {artwork?.image_url && (
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="w-full max-h-64 object-contain rounded mb-4"
          />
        )}

        <div className="space-y-3 mb-4">
          {messages.map((msg) => {
            const isMe = msg.sender_id === userId;
            const username = msg.sender?.[0]?.username ?? 'Unknown';
            return (
              <div
                key={msg.id}
                className={`p-3 rounded-md max-w-xs ${
                  isMe ? 'bg-blue-100 ml-auto text-right' : 'bg-gray-200'
                }`}
              >
                <p className="text-xs font-semibold mb-1">{username}</p>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
            );
          })}
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
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
