import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

type OfferModalProps = {
  isOpen: boolean;
  onClose: () => void;
  artistId: string;
  artworkId: string;
  artworkTitle: string;
  price: number;
};

export default function OfferModal({ isOpen, onClose, artistId, artworkId, artworkTitle, price }: OfferModalProps) {
  const [offer, setOffer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const minOffer = price * 0.6;

  const handleSubmit = async () => {
    const offerValue = parseFloat(offer);
    if (isNaN(offerValue) || offerValue < minOffer) {
      setError(`Offers must be at least £${minOffer.toFixed(2)}`);
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to make an offer.');
      setLoading(false);
      return;
    }

    const message = `Hi, I’d like to offer £${offerValue.toFixed(2)} for "${artworkTitle}".`;

    const { error: insertError } = await supabase.from('messages').insert([
      {
        sender_id: user.id,
        receiver_id: artistId,
        artwork_id: artworkId,
        content: message,
      },
    ]);

    if (insertError) {
      setError('Failed to send message.');
      console.error(insertError);
      setLoading(false);
      return;
    }

    router.push(`/messages/${artistId}?artworkId=${artworkId}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-black">
        <h2 className="text-lg font-bold mb-2">Make an Offer</h2>
        <p className="text-sm mb-4">
          The listed price is <strong>£{price}</strong>. You may offer at least <strong>£{minOffer.toFixed(2)}</strong>.
        </p>
        <input
          type="number"
          placeholder="Your offer (£)"
          className="border border-black p-2 w-full rounded mb-2"
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
        />
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Offer'}
          </button>
        </div>
      </div>
    </div>
  );
}
