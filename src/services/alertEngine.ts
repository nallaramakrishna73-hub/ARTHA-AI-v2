/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import cron from 'node-cron';
import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { providerRouter } from './providerRouter.ts';
import { analyzeTechnical } from '../analysis/technical.ts';
import { db } from '../db/index.ts';
import { alerts, alertEvents } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { getMarketSessionStatus } from '../utils/format.ts';

export interface AlertEventData {
  id: string;
  alertId: string;
  symbol: string;
  conditionType: string;
  message: string;
  triggeredAt: string;
}

class AlertEngine {
  private wss: WebSocketServer | null = null;
  private sseClients: Response[] = [];

  public init(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/api/alerts/ws' });

    this.wss.on('connection', (ws) => {
      console.log('[AlertEngine] Client connected to live WebSocket alert stream');
      ws.send(JSON.stringify({ type: 'CONNECTED', message: 'ARTHA AI Real-Time Alert Engine Active' }));
    });

    // Run background cron every minute during market hours
    cron.schedule('* * * * *', async () => {
      const session = getMarketSessionStatus();
      if (session.isOpen) {
        await this.checkAlerts();
      }
    });

    console.log('[AlertEngine] Cron schedule initialized (Market Hours check)');
  }

  public broadcastEvent(event: AlertEventData) {
    // 1. Send via WebSocket
    if (this.wss) {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'ALERT_TRIGGERED', data: event }));
        }
      });
    }

    // 2. Send via SSE
    const message = `data: ${JSON.stringify(event)}\n\n`;
    this.sseClients.forEach((res: any) => {
      res.write(message);
    });
  }

  public registerSseClient(res: any) {
    this.sseClients.push(res);
  }

  public removeSseClient(res: any) {
    this.sseClients = this.sseClients.filter(c => c !== res);
  }

  public async checkAlerts() {
    try {
      const activeAlerts = db.select().from(alerts).where(eq(alerts.active, true)).all();
      const now = new Date();

      for (const alert of activeAlerts) {
        if (alert.coolDownUntil && new Date(alert.coolDownUntil) > now) {
          continue; // In cooldown
        }

        const quote = await providerRouter.getQuote(alert.symbol);
        const bars = await providerRouter.getHistory(alert.symbol);
        const tech = analyzeTechnical(bars, alert.symbol);

        let triggered = false;
        let msg = '';

        switch (alert.conditionType) {
          case 'PRICE_ABOVE':
            if (quote.price > alert.targetValue) {
              triggered = true;
              msg = `${alert.symbol} price crossed above ₹${alert.targetValue} (Current: ₹${quote.price.toFixed(2)}). Potentially significant price movement detected.`;
            }
            break;
          case 'PRICE_BELOW':
            if (quote.price < alert.targetValue) {
              triggered = true;
              msg = `${alert.symbol} price crossed below ₹${alert.targetValue} (Current: ₹${quote.price.toFixed(2)}). Downside price threshold breached.`;
            }
            break;
          case 'RSI_BELOW':
            if (tech.rsi14 < alert.targetValue) {
              triggered = true;
              msg = `${alert.symbol} RSI(14) crossed below ${alert.targetValue} (Current RSI: ${tech.rsi14}). Technical oversold boundary reached.`;
            }
            break;
          case 'RSI_ABOVE':
            if (tech.rsi14 > alert.targetValue) {
              triggered = true;
              msg = `${alert.symbol} RSI(14) crossed above ${alert.targetValue} (Current RSI: ${tech.rsi14}). Technical overbought threshold reached.`;
            }
            break;
          case 'VOLUME_SPIKE':
            if (tech.volumeAnalysis.isSpike) {
              triggered = true;
              msg = `${alert.symbol} volume spiked to ${tech.volumeAnalysis.ratio.toFixed(1)}x 20-day average volume. Institutional volume spike detected.`;
            }
            break;
        }

        if (triggered) {
          const cooldown = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hr cooldown
          db.update(alerts).set({ coolDownUntil: cooldown }).where(eq(alerts.id, alert.id)).run();

          const eventId = `evt-${Date.now()}`;
          const eventData: AlertEventData = {
            id: eventId,
            alertId: alert.id,
            symbol: alert.symbol,
            conditionType: alert.conditionType,
            message: msg,
            triggeredAt: now.toISOString(),
          };

          db.insert(alertEvents).values(eventData).run();
          this.broadcastEvent(eventData);
        }
      }
    } catch (err) {
      console.error('[AlertEngine] Error evaluating active alerts:', err);
    }
  }
}

export const alertEngine = new AlertEngine();
