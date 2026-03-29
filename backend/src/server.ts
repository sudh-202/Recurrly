import { verifyToken } from '@clerk/backend';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import sql from './db/index.js';
import { create, getOne, list, listCategories, remove, spendingSummary, update } from './routes/subscriptions.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json());

// ── Auth Middleware ──────────────────────────────────────────
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing Authorization header' });
      return;
    }

    const token = authHeader.slice(7);

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    const clerkUserId = payload.sub;

    // Get or create local user
    const existing = await sql`SELECT id FROM users WHERE clerk_id = ${clerkUserId} LIMIT 1`;
    if (existing.length > 0) {
      (req as any).localUserId = existing[0].id;
    } else {
      const created = await sql`
        INSERT INTO users (clerk_id, email) VALUES (${clerkUserId}, 'pending')
        RETURNING id
      `;
      (req as any).localUserId = created[0].id;
    }

    next();
  } catch (err: any) {
    console.error('Auth error details:', err?.message, err?.code, err?.name);
    res.status(401).json({ error: 'Authentication failed', detail: err?.message });
  }
}

// ── Routes ──────────────────────────────────────────────────
// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Categories (public)
app.get('/api/categories', listCategories);

// Subscription routes (protected)
app.get('/api/subscriptions/spending/summary', requireAuth, spendingSummary);
app.get('/api/subscriptions', requireAuth, list);
app.post('/api/subscriptions', requireAuth, create);
app.get('/api/subscriptions/:id', requireAuth, getOne);
app.patch('/api/subscriptions/:id', requireAuth, update);
app.delete('/api/subscriptions/:id', requireAuth, remove);

// ── Start ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Recurly API running on http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
  });
}

export default app;
