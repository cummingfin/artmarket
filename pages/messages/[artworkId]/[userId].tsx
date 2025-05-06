// pages/messages/[artworkId]/[userId].tsx
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
  const { artworkId, userId: otherUserId } = router.query;

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: session } = await supabase.auth.getSession();
      const user = session.session?.user.id;
      if (!user || !artworkId || !otherUserId) return;

      setCurrentUserId(user);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('artwork_id', artworkId)
        .or(`sender_id.eq.${user},receiver_id.eq.${user}`)
        .order('created_at', { ascending: true });

      if (!error) {
        setMessages(data || []);
      }
    };

    fetchMessages();
  }, [artworkId, otherUserId]);

  const handleSend = async () => {
    if (!currentUserId || !content.trim() || typeof artworkId !== 'string') return;

    const messagePayload = {
      artwork_id: artworkId,
      sender_id: currentUserId,
      receiver_id: otherUserId,
      content,
    };

    const { error } = await supabase.from('messages').insert([messagePayload]);

    if (!error) {
      setContent('');
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('artwork_id', artworkId)
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
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
                msg.sender_id === currentUserId ? 'bg-gray-200 text-right' : 'bg-blue-100'
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
