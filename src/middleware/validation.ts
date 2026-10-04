/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const SymbolSchema = z.string().regex(/^[A-Z0-9&\-\^]{1,20}(\.(NS|BO))?$/, {
  message: 'Invalid stock symbol format. Allowed: NSE/BSE symbols like RELIANCE.NS, TCS.NS or ^NSEI',
});

export function validateSymbolParam(req: Request, res: Response, next: NextFunction) {
  const symbol = (req.params.symbol || req.body.symbol || '').toUpperCase().trim();
  const parsed = SymbolSchema.safeParse(symbol);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SYMBOL',
        message: parsed.error.issues[0].message,
        requestId: req.headers['x-request-id'] || 'req-unknown',
      },
    });
  }

  req.params.symbol = symbol;
  next();
}

// Prompt Injection Sanitizer for external news / input text
export function sanitizeInputText(input: string): string {
  if (!input) return '';
  return input
    .replace(/ignore previous instructions/gi, '[filtered]')
    .replace(/system prompt/gi, '[filtered]')
    .replace(/you are now/gi, '[filtered]')
    .replace(/<script.*?>.*?<\/script>/gis, '')
    .trim();
}
