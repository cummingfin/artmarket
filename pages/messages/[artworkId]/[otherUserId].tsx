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
  artwork_id: string;
  artworks?: { title: string }[];
  sender?: { username: string }[];
  receiver?: { username: string }[];
};

export default function MessageThread() {
  const router = useRouter();
  const { artworkId, otherUserId } = router.query;

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [artworkTitle, setArtworkTitle] = useState('');
  const [otherUsername, setOtherUsername] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
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
          artwork_id,
          artworks ( title ),
          sender:sender_id ( username ),
          receiver:receiver_id ( username )
        `)
        .eq('artwork_id', artworkId)
        .or(`sender_id.eq.${currentUser},receiver_id.eq.${currentUser}`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as Message[]);

        // Set artwork title
        setArtworkTitle(data[0]?.artworks?.[0]?.title ?? 'Untitled');

        // Determine other user's username
        const otherUser =
          data[0].sender_id === currentUser
            ? data[0].receiver?.[0]?.username
            : data[0].sender?.[0]?.username;

        setOtherUsername(otherUser ?? 'User');
      } else {
        console.error('Failed to load messages:', error?.message);
      }
    };

    if (artworkId && otherUserId) {
      fetchMessages();
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

    if (error) {
      console.error('Error sending message:', error.message);
      return;
    }

    setContent('');

    // Re-fetch messages
    const { data } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_id,
        receiver_id,
        artwork_id,
        sender:sender_id ( username )
      `)
      .eq('artwork_id', artworkId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    setMessages(data as Message[]);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 text-black bg-white min-h-screen">
        <h1 className="text-xl font-bold mb-2">Chat about: <span className="italic">{artworkTitle}</span></h1>
        <p className="text-sm text-gray-500 mb-4">Talking with: <strong>{otherUsername}</strong></p>

        <div className="space-y-3 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                msg.sender_id === userId
                  ? 'bg-gray-200 ml-auto text-right'
                  : 'bg-blue-100 mr-auto text-left'
              }`}
            >
              <p className="text-xs font-semibold mb-1">
                {msg.sender?.[0]?.username ?? 'Unknown'}
              </p>
              <p className="text-sm">{msg.content}</p>
              <p className="text-[10px] text-gray-500 mt-1">
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </div>
          ))}
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
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
