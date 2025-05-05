// pages/messages/[artworkId].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

export default function MessageThread() {
  const router = useRouter();
  const { artworkId } = router.query;

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: session } = await supabase.auth.getSession();
      const currentUser = session.session?.user.id;
      setUserId(currentUser || null);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: true });

      if (!error) {
        setMessages(data || []);
      }
    };

    if (artworkId) fetchMessages();
  }, [artworkId]);

  const handleSend = async () => {
    if (!userId || !content.trim()) return;
  
    let receiver_id: string | null = null;
  
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      receiver_id = lastMessage.sender_id !== userId ? lastMessage.sender_id : lastMessage.receiver_id;
    } else {
      const { data: artwork, error: artworkError } = await supabase
        .from('artworks')
        .select('artist_id')
        .eq('id', artworkId)
        .maybeSingle();
  
      if (artworkError || !artwork) {
        console.error('❌ Failed to fetch artwork info:', artworkError?.message);
        return;
      }
  
      receiver_id = artwork.artist_id === userId ? null : artwork.artist_id;
    }
  
    const messagePayload = {
      artwork_id: artworkId,
      sender_id: userId,
      receiver_id,
      content,
    };
  
    console.log('📤 Sending message payload:', messagePayload);
  
    const { error } = await supabase.from('messages').insert([messagePayload]);
  
    if (error) {
      console.error('❌ Supabase insert error:', error);
    } else {
      setContent('');
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: true });
  
      setMessages(data || []);
    }
  };
  

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 text-black bg-white min-h-screen">
        <h1 className="text-xl font-bold mb-4">Messages</h1>

        <div className="space-y-3 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded ${
                msg.sender_id === userId ? 'bg-gray-200 text-right' : 'bg-blue-100'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
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
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
