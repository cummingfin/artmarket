// pages/api/checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import stripe from '../../lib/stripe'; // use relative path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, price, artworkId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: Math.round(price * 100),
            product_data: { name: title },
          },
          quantity: 1,
        },
      ],
      metadata: {
        artworkId: String(artworkId), // important: ensure it's a string
      },
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/artwork/gallery`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
}
