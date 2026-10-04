/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import bcrypt from 'bcryptjs';
import { db, initDatabase } from './index.ts';
import { users, portfolios, holdings, watchlists, watchlistItems } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  initDatabase();

  const existingDemoUser = db.select().from(users).where(eq(users.email, 'demo@artha.ai')).get();
  if (!existingDemoUser) {
    const passwordHash = await bcrypt.hash('artha123', 10);
    const userId = 'usr-demo-1';
    const now = new Date().toISOString();

    db.insert(users).values({
      id: userId,
      email: 'demo@artha.ai',
      passwordHash,
      role: 'admin',
      createdAt: now,
    }).run();

    const portfolioId = 'port-demo-1';
    db.insert(portfolios).values({
      id: portfolioId,
      userId,
      name: 'India Core Growth Portfolio',
      description: 'Balanced multi-sector equity portfolio focusing on blue-chip NIFTY 50 companies',
      createdAt: now,
    }).run();

    const sampleHoldings = [
      { id: 'h-1', portfolioId, symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', sector: 'Energy & Petrochemicals', quantity: 50, avgBuyPrice: 2850.0 },
      { id: 'h-2', portfolioId, symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'Information Technology', quantity: 40, avgBuyPrice: 3920.0 },
      { id: 'h-3', portfolioId, symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', sector: 'Financial Services', quantity: 120, avgBuyPrice: 1540.0 },
      { id: 'h-4', portfolioId, symbol: 'INFY.NS', name: 'Infosys Ltd.', sector: 'Information Technology', quantity: 80, avgBuyPrice: 1720.0 },
      { id: 'h-5', portfolioId, symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd.', sector: 'Financial Services', quantity: 100, avgBuyPrice: 1120.0 },
      { id: 'h-6', portfolioId, symbol: 'LT.NS', name: 'Larsen & Toubro Ltd.', sector: 'Infrastructure & Capital Goods', quantity: 30, avgBuyPrice: 3450.0 },
    ];

    for (const h of sampleHoldings) {
      db.insert(holdings).values({
        ...h,
        createdAt: now,
      }).run();
    }

    const wlId = 'wl-demo-1';
    db.insert(watchlists).values({
      id: wlId,
      userId,
      name: 'Blue Chip Monitor',
      createdAt: now,
    }).run();

    const wlSymbols = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'TATAMOTORS.NS'];
    for (let i = 0; i < wlSymbols.length; i++) {
      db.insert(watchlistItems).values({
        id: `wli-${i + 1}`,
        watchlistId: wlId,
        symbol: wlSymbols[i],
        createdAt: now,
      }).run();
    }

    console.log('[Seed] Database seeded with demo user (demo@artha.ai) and sample portfolios.');
  }
}
