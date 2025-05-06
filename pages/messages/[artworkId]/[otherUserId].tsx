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
  sender: { username: string };
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
  const [otherUsername, setOtherUsername] = useState<string>('User');

  useEffect(() => {
    const load = async () => {
      const { data: session } = await supabase.auth.getSession();
      const currentUser = session.session?.user.id;
      setUserId(currentUser || null);

      if (!artworkId || !otherUserId || !currentUser) return;

      // Fetch messages with sender's username
      const { data: messageData } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          sender:sender_id (username)
        `)
        .eq('artwork_id', artworkId)
        .or(`sender_id.eq.${currentUser},receiver_id.eq.${currentUser}`)
        .order('created_at');

      if (messageData) {
        setMessages(
          messageData.map((msg: any) => ({
            ...msg,
            sender: msg.sender?.[0] ?? { username: 'Unknown' }
          }))
        );
      }

      // Get artwork
      const { data: art } = await supabase
        .from('artworks')
        .select('title, image_url')
        .eq('id', artworkId)
        .single();

      if (art) setArtwork(art);

      // Get other user's name
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', otherUserId)
        .single();

      if (userProfile?.username) setOtherUsername(userProfile.username);
    };

    load();
  }, [artworkId, otherUserId]);

  const handleSend = async () => {
    if (!userId || !content.trim()) return;

    const { error } = await supabase.from('messages').insert([
      {
        artwork_id: artworkId,
        sender_id: userId,
        receiver_id: otherUserId,
        content
      }
    ]);

    if (!error) {
      setContent('');
      // Re-fetch
      const { data: updatedMessages } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          sender:sender_id (username)
        `)
        .eq('artwork_id', artworkId)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at');

      if (updatedMessages) {
        setMessages(
          updatedMessages.map((msg: any) => ({
            ...msg,
            sender: msg.sender?.[0] ?? { username: 'Unknown' }
          }))
        );
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 text-black bg-white min-h-screen">
        <h1 className="text-2xl font-bold mb-2">
          Chat about: <em>{artwork?.title ?? 'Untitled'}</em>
        </h1>
        <p className="text-sm mb-4 text-gray-500">Talking with: <strong>{otherUsername}</strong></p>

        {artwork?.image_url && (
          <img src={artwork.image_url} alt={artwork.title} className="w-full max-h-60 object-cover rounded mb-4" />
        )}

        <div className="space-y-3 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded max-w-[80%] ${
                msg.sender_id === userId ? 'bg-blue-100 ml-auto text-right' : 'bg-gray-200'
              }`}
            >
              <p className="text-sm font-semibold">{msg.sender?.username ?? 'Unknown'}</p>
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
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
