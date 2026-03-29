-- Recurly Database Schema for Neon PostgreSQL
-- Run this once against your Neon database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

-- Users table (mirrors Clerk user ID)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscription services / providers
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon_name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id),
    plan TEXT NOT NULL DEFAULT 'Standard',
    billing TEXT NOT NULL DEFAULT 'Monthly',
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
    renewal_date TIMESTAMPTZ NOT NULL,
    start_date TIMESTAMPTZ,
    manage_url TEXT,
    plan_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_date ON subscriptions(renewal_date);

-- ─────────────────────────────────────────────
-- SEED CATEGORIES (matches your app's categories)
-- ─────────────────────────────────────────────
INSERT INTO categories (name, slug, icon_name, color) VALUES
    ('Entertainment', 'entertainment', 'play-circle', '#FF6B6B'),
    ('Music', 'music', 'music', '#4ECDC4'),
    ('Productivity', 'productivity', 'briefcase', '#45B7D1'),
    ('Cloud Storage', 'cloud', 'cloud', '#96CEB4'),
    ('Design', 'design', 'pen-tool', '#F7DC6F'),
    ('Social', 'social', 'users', '#DDA0DD'),
    ('Gaming', 'gaming', 'gamepad', '#98D8C8'),
    ('News', 'news', 'book-open', '#86A8C7'),
    ('Finance', 'finance', 'trending-up', '#56CF9A'),
    ('Other', 'other', 'box', '#C0C0C0')
ON CONFLICT (slug) DO NOTHING;
