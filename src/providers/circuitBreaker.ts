/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface ProviderMetrics {
  failures: number[]; // timestamps of failures in 60s window
  isOpen: boolean;
  openedAt: number;
}

export class CustomCircuitBreaker {
  private states = new Map<string, ProviderMetrics>();
  private failureThreshold = 5;
  private timeWindowMs = 60 * 1000;
  private cooldownMs = 120 * 1000;

  public canExecute(providerName: string): boolean {
    if (process.env.FORCE_FAIL === providerName || process.env.FORCE_FAIL === 'all') {
      return false;
    }
    const state = this.states.get(providerName);
    if (!state) return true;

    if (state.isOpen) {
      if (Date.now() - state.openedAt > this.cooldownMs) {
        // Half-open / reset state
        state.isOpen = false;
        state.failures = [];
        return true;
      }
      return false;
    }
    return true;
  }

  public recordSuccess(providerName: string) {
    const state = this.states.get(providerName);
    if (state) {
      state.failures = [];
      state.isOpen = false;
    }
  }

  public recordFailure(providerName: string) {
    let state = this.states.get(providerName);
    if (!state) {
      state = { failures: [], isOpen: false, openedAt: 0 };
      this.states.set(providerName, state);
    }
    const now = Date.now();
    state.failures = state.failures.filter(t => now - t < this.timeWindowMs);
    state.failures.push(now);

    if (state.failures.length >= this.failureThreshold) {
      state.isOpen = true;
      state.openedAt = now;
      console.warn(`[CircuitBreaker] Provider ${providerName} tripped OPEN for ${this.cooldownMs / 1000}s`);
    }
  }

  public getStatus(providerName: string) {
    const state = this.states.get(providerName);
    return {
      provider: providerName,
      isOpen: state ? state.isOpen : false,
      recentFailures: state ? state.failures.length : 0,
    };
  }
}

export const circuitBreaker = new CustomCircuitBreaker();
