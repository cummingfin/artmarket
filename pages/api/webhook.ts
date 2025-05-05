import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { supabase } from '@/lib/supabaseClient';

// Disable body parsing so we can verify the signature
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
} catch (err: unknown) {
    if (err instanceof Error) {
      console.error('⚠️ Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    } else {
      return res.status(400).send('Webhook Error: Unknown error');
    }
  }

  // Handle the checkout session completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // We passed artworkId in success_url, so it should be in metadata or client_reference_id
    const artworkId = session?.metadata?.artworkId;

    if (artworkId) {
      const { error } = await supabase
        .from('artworks')
        .update({ sold: true })
        .eq('id', artworkId);

      if (error) {
        console.error('❌ Failed to update artwork:', error.message);
        return res.status(500).send('Failed to update artwork status');
      }

      console.log(`✅ Artwork ${artworkId} marked as sold`);
    } else {
      console.warn('⚠️ No artworkId provided in session');
    }
  }

  res.status(200).json({ received: true });
}
