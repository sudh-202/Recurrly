import type { Request, Response } from 'express';
import sql from '../db/index.js';

export interface SubscriptionInput {
  name: string;
  icon_name: string;
  category_id: string;
  plan: string;
  billing: string;
  price: number;
  currency: string;
  renewal_date: string;
  start_date?: string;
  manage_url?: string;
  plan_url?: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  name: string;
  icon_name: string;
  category_id: string;
  plan: string;
  billing: string;
  price: number;
  currency: string;
  status: 'active' | 'cancelled';
  renewal_date: Date;
  start_date: Date | null;
  manage_url: string | null;
  plan_url: string | null;
  created_at: Date;
  updated_at: Date;
  category_slug?: string;
  category_color?: string;
  category_icon?: string;
}

// Attach user middleware used by server.ts requireAuth

// GET /api/subscriptions - List all subscriptions for the user
export async function list(req: Request, res: Response) {
  try {
    const userId = (req as any).localUserId;
    const rows = await sql`
      SELECT 
        s.*,
        c.slug as category_slug,
        c.color as category_color,
        c.icon_name as category_icon
      FROM subscriptions s
      JOIN categories c ON c.id = s.category_id
      WHERE s.user_id = ${userId}
      ORDER BY s.created_at DESC
    `;
    res.json(rows);
  } catch (err) {
    console.error('List subscriptions error:', err);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
}

// POST /api/subscriptions - Create a new subscription
export async function create(req: Request, res: Response) {
  try {
    const userId = (req as any).localUserId;
    const {
      name, icon_name, category_id, plan, billing,
      price, currency, renewal_date, start_date,
      manage_url, plan_url,
    } = req.body as SubscriptionInput;

    if (!name || !category_id || price == null || !renewal_date) {
      res.status(400).json({ error: 'Missing required fields: name, category_id, price, renewal_date' });
      return;
    }

    const rows = await sql`
      INSERT INTO subscriptions (
        user_id, name, icon_name, category_id, plan, billing,
        price, currency, renewal_date, start_date, manage_url, plan_url
      ) VALUES (
        ${userId}, ${name}, ${icon_name}, ${category_id}, ${plan ?? 'Monthly'}, ${billing ?? 'Monthly'},
        ${price}, ${currency ?? 'INR'}, ${new Date(renewal_date).toISOString()},
        ${start_date ? new Date(start_date).toISOString() : null},
        ${manage_url ?? null}, ${plan_url ?? null}
      )
      RETURNING *
    `;

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create subscription error:', err);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
}

// GET /api/subscriptions/:id - Get a single subscription
export async function getOne(req: Request, res: Response) {
  try {
    const userId = (req as any).localUserId;
    const { id } = req.params;

    const rows = await sql`
      SELECT 
        s.*,
        c.slug as category_slug,
        c.color as category_color,
        c.icon_name as category_icon
      FROM subscriptions s
      JOIN categories c ON c.id = s.category_id
      WHERE s.id = ${id} AND s.user_id = ${userId}
    `;

    if (rows.length === 0) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get subscription error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
}

// PATCH /api/subscriptions/:id - Update a subscription
export async function update(req: Request, res: Response) {
  try {
    const userId = (req as any).localUserId;
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'name', 'icon_name', 'category_id', 'plan', 'billing',
      'price', 'currency', 'status', 'renewal_date', 'start_date',
      'manage_url', 'plan_url',
    ];

    for (const field of allowedFields) {
      if (field in updates) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(field === 'price' ? parseFloat(updates[field]) : updates[field]);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, userId);

    const query = `
      UPDATE subscriptions 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Update subscription error:', err);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
}

// DELETE /api/subscriptions/:id - Delete a subscription
export async function remove(req: Request, res: Response) {
  try {
    const userId = (req as any).localUserId;
    const { id } = req.params;

    const result = await sql`
      DELETE FROM subscriptions WHERE id = ${id} AND user_id = ${userId} RETURNING id
    `;

    if (result.length === 0) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    res.json({ success: true, id });
  } catch (err) {
    console.error('Delete subscription error:', err);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
}

// GET /api/subscriptions/spending/summary - Get spending by category
export async function spendingSummary(req: Request, res: Response) {
  try {
    const userId = (req as any).localUserId;

    const rows = await sql`
      SELECT 
        c.name as category,
        c.slug as category_slug,
        c.color as category_color,
        c.icon_name as category_icon,
        SUM(s.price) as total_price,
        COUNT(*) as subscription_count
      FROM subscriptions s
      JOIN categories c ON c.id = s.category_id
      WHERE s.user_id = ${userId} AND s.status = 'active'
      GROUP BY c.id
      ORDER BY total_price DESC
    `;

    res.json(rows);
  } catch (err) {
    console.error('Spending summary error:', err);
    res.status(500).json({ error: 'Failed to fetch spending summary' });
  }
}

// GET /api/categories - List all available categories
export async function listCategories(_req: Request, res: Response) {
  try {
    const rows = await sql`SELECT * FROM categories ORDER BY name ASC`;
    res.json(rows);
  } catch (err) {
    console.error('List categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}
