import type { NextApiRequest, NextApiResponse } from 'next';
import stripe from '@/lib/stripe'; // or use relative import if needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, price, shippingCost, artworkId } = req.body;

  if (!title || !price || !shippingCost || !artworkId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const totalAmount = price + shippingCost;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['GB'], // change if international later
      },
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: Math.round(totalAmount * 100),
            product_data: {
              name: title,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        artworkId,
      },
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/artwork/gallery`,
    });

    res.status(200).json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    res.status(500).json({ error: message });
  }
}
