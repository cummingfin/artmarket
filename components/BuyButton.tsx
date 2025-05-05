// components/BuyButton.tsx
import { useState } from 'react';

type BuyButtonProps = {
  artwork: {
    id: number | string;
    title: string;
    price: number;
    shipping_cost: number;
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
          shippingCost: artwork.shipping_cost,
          artworkId: artwork.id,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
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
