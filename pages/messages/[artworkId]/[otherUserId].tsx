// pages/messages/[artworkId]/[otherUserId].tsx
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
  const { artworkId, otherUserId } = router.query;

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: session } = await supabase.auth.getSession();
      const currentUser = session.session?.user.id;
      setUserId(currentUser || null);

      if (!currentUser || !artworkId || !otherUserId) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('artwork_id', artworkId)
        .or(`sender_id.eq.${currentUser},receiver_id.eq.${currentUser}`)
        .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
        .order('created_at', { ascending: true });

      if (!error) {
        // Filter only relevant messages between the two users
        const threadMessages = (data || []).filter(
          (msg) =>
            (msg.sender_id === currentUser && msg.receiver_id === otherUserId) ||
            (msg.sender_id === otherUserId && msg.receiver_id === currentUser)
        );
        setMessages(threadMessages);
      } else {
        console.error('Error fetching messages:', error.message);
      }
    };

    fetchMessages();
  }, [artworkId, otherUserId]);

  const handleSend = async () => {
    if (!userId || !content.trim() || typeof otherUserId !== 'string') return;

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
        .select('*')
        .eq('artwork_id', artworkId)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
        .order('created_at', { ascending: true });

      const updatedMessages = (data || []).filter(
        (msg) =>
          (msg.sender_id === userId && msg.receiver_id === otherUserId) ||
          (msg.sender_id === otherUserId && msg.receiver_id === userId)
      );

      setMessages(updatedMessages);
    } else {
      console.error('Error sending message:', error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 text-black bg-white min-h-screen">
        <h1 className="text-xl font-bold mb-4">Conversation</h1>

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
