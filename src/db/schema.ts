/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('user').notNull(),
  createdAt: text('created_at').notNull(),
});

export const watchlists = sqliteTable('watchlists', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
});

export const watchlistItems = sqliteTable('watchlist_items', {
  id: text('id').primaryKey(),
  watchlistId: text('watchlist_id').notNull(),
  symbol: text('symbol').notNull(),
  createdAt: text('created_at').notNull(),
});

export const portfolios = sqliteTable('portfolios', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
});

export const holdings = sqliteTable('holdings', {
  id: text('id').primaryKey(),
  portfolioId: text('portfolio_id').notNull(),
  symbol: text('symbol').notNull(),
  name: text('name').notNull(),
  sector: text('sector').notNull(),
  quantity: integer('quantity').notNull(),
  avgBuyPrice: real('avg_buy_price').notNull(),
  createdAt: text('created_at').notNull(),
});

export const alerts = sqliteTable('alerts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  symbol: text('symbol').notNull(),
  conditionType: text('condition_type').notNull(), // PRICE_ABOVE, PRICE_BELOW, RSI_BELOW, EMA_CROSS, VOLUME_SPIKE, NEWS_MAJOR
  targetValue: real('target_value').notNull(),
  active: integer('active', { mode: 'boolean' }).default(true).notNull(),
  coolDownUntil: text('cool_down_until'),
  createdAt: text('created_at').notNull(),
});

export const alertEvents = sqliteTable('alert_events', {
  id: text('id').primaryKey(),
  alertId: text('alert_id').notNull(),
  symbol: text('symbol').notNull(),
  message: text('message').notNull(),
  triggeredAt: text('triggered_at').notNull(),
});

export const researchRuns = sqliteTable('research_runs', {
  id: text('id').primaryKey(),
  symbol: text('symbol').notNull(),
  stateJson: text('state_json').notNull(),
  overallScore: integer('overall_score').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  createdAt: text('created_at').notNull(),
});

export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  symbol: text('symbol').notNull(),
  reportJson: text('report_json').notNull(),
  createdAt: text('created_at').notNull(),
});

export const apiUsage = sqliteTable('api_usage', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(),
  endpoint: text('endpoint').notNull(),
  status: text('status').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  createdAt: text('created_at').notNull(),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  action: text('action').notNull(),
  details: text('details').notNull(),
  ip: text('ip'),
  createdAt: text('created_at').notNull(),
});
