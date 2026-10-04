/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { CustomCircuitBreaker } from '../src/providers/circuitBreaker.ts';

describe('Circuit Breaker Resilience Tests', () => {
  it('Trips open after 5 consecutive failures', () => {
    const cb = new CustomCircuitBreaker();
    expect(cb.canExecute('test-provider')).toBe(true);

    for (let i = 0; i < 5; i++) {
      cb.recordFailure('test-provider');
    }

    expect(cb.canExecute('test-provider')).toBe(false);
    expect(cb.getStatus('test-provider').isOpen).toBe(true);
  });

  it('Resets when success is recorded', () => {
    const cb = new CustomCircuitBreaker();
    cb.recordFailure('test-provider-2');
    cb.recordSuccess('test-provider-2');

    expect(cb.getStatus('test-provider-2').recentFailures).toBe(0);
    expect(cb.canExecute('test-provider-2')).toBe(true);
  });
});
