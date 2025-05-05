// components/BuyButton.tsx
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type BuyButtonProps = {
  artwork: {
    id: number | string;
    title: string;
    price: number;
  };
};

export default function BuyButton({ artwork }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: artwork.title,
          price: artwork.price,
          artworkId: artwork.id,
        }),
      });

      const data = await res.json();
      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });

      }
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuy}
      className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
      disabled={loading}
    >
      {loading ? 'Redirecting...' : 'Buy Now'}
    </button>
  );
}
