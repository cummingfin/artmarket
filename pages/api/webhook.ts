import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import supabaseAdmin from '@/lib/supabaseAdmin';

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
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('⚠️ Webhook signature verification failed:', message);
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const artworkId = session?.metadata?.artworkId;
    const address = session?.customer_details?.address;
    const email = session?.customer_details?.email;

    if (!artworkId) {
      console.warn('⚠️ No artworkId in session metadata');
      return res.status(200).send('No artworkId provided');
    }

    // 1. Mark artwork as sold
    const { error: updateError } = await supabaseAdmin
      .from('artworks')
      .update({ sold: true })
      .eq('id', artworkId);

    if (updateError) {
      console.error('❌ Failed to mark artwork as sold:', updateError.message);
      return res.status(500).send('Failed to update artwork');
    }

    // 2. Fetch price + shipping
    const { data: artwork, error: fetchError } = await supabaseAdmin
      .from('artworks')
      .select('price, shipping_cost')
      .eq('id', artworkId)
      .maybeSingle();

    if (fetchError || !artwork) {
      console.error('❌ Failed to fetch artwork:', fetchError?.message);
      return res.status(500).send('Failed to fetch artwork data');
    }

    // ✅ 3. Calculate correct service fee and earnings
    const serviceFee = parseFloat((artwork.price * 0.08).toFixed(2));
    const artistEarnings = parseFloat(
      ((artwork.price - serviceFee) + artwork.shipping_cost).toFixed(2)
    );

    // 4. Insert order
    const { error: orderError } = await supabaseAdmin.from('orders').insert([
      {
        artwork_id: artworkId,
        buyer_email: email,
        shipping_address: address,
        service_fee: serviceFee,
        artist_earnings: artistEarnings,
      },
    ]);

    if (orderError) {
      console.error('❌ Failed to insert order:', orderError.message);
      return res.status(500).send('Failed to save order');
    }

    console.log(`✅ Artwork ${artworkId} marked sold. Order stored.`);
  }

  res.status(200).json({ received: true });
}
