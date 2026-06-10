require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
  process.env.ALLOWED_ORIGIN || 'https://ninja-tyden.cz',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',  // VS Code Live Server
  'http://127.0.0.1:5500',
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed — ' + origin));
    }
  },
  methods: ['GET', 'POST'],
}));

// Raw body must be parsed before express.json for Stripe webhook signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// ─── POST /api/create-checkout-session ───────────────────────────────────────
app.post('/api/create-checkout-session', async (req, res) => {
  const {
    childName = '',
    parentName = '',
    email = '',
    phone = '',
  } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price_data: {
            currency: 'czk',
            product_data: {
              name: 'Ninja Týden 2025 – letní příměstský tábor',
              description: '7.–11. července 2025 · Po–Pá 8:00–16:00 · skiAreál Komárka · Vše v ceně',
            },
            unit_amount: 349000, // 3 490 Kč = 349 000 haléřů
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${process.env.FRONTEND_URL || 'https://ninja-tyden.cz'}/dekujeme?session_id={CHECKOUT_SESSION_ID}`,
      ...(email && { customer_email: email }),
      locale: 'cs',
      metadata: {
        child_name: childName,
        parent_name: parentName,
        phone: phone,
      },
    });

    res.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('Stripe session creation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/session-status ──────────────────────────────────────────────────
app.get('/api/session-status', async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id parameter' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.json({
      status: session.status,               // 'open' | 'complete' | 'expired'
      customerEmail: session.customer_email || session.customer_details?.email || null,
      metadata: session.metadata,
    });
  } catch (err) {
    console.error('Session retrieve error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/webhook ────────────────────────────────────────────────────────
// Register this endpoint in Stripe Dashboard → Developers → Webhooks
// Event to listen for: checkout.session.completed
app.post('/api/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
    return res.json({ received: true });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send('Webhook Error: ' + err.message);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Payment confirmed:', {
      id: session.id,
      child: session.metadata?.child_name,
      parent: session.metadata?.parent_name,
      email: session.customer_details?.email,
      amountKc: (session.amount_total / 100).toFixed(0),
    });
    // TODO: notify n8n, send confirmation email, update your database, etc.
  }

  res.json({ received: true });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Ninja Týden API → http://localhost:${PORT}`);
});
