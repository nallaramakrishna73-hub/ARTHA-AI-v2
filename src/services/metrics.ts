/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import prometheus from 'prom-client';

// Register prometheus metrics
export const register = new prometheus.Registry();

prometheus.collectDefaultMetrics({ register, prefix: 'artha_' });

export const httpRequestsTotal = new prometheus.Counter({
  name: 'artha_http_requests_total',
  help: 'Total HTTP requests handled by ARTHA AI API server',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

export const httpRequestDuration = new prometheus.Histogram({
  name: 'artha_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export const agentRunsTotal = new prometheus.Counter({
  name: 'artha_agent_runs_total',
  help: 'Total LangGraph agent research dossier executions',
  labelNames: ['symbol', 'status'],
  registers: [register],
});

export const cacheHitsTotal = new prometheus.Counter({
  name: 'artha_cache_hits_total',
  help: 'Total cache hits across provider router',
  registers: [register],
});

export const cacheMissesTotal = new prometheus.Counter({
  name: 'artha_cache_misses_total',
  help: 'Total cache misses across provider router',
  registers: [register],
});

export const providerErrorsTotal = new prometheus.Counter({
  name: 'artha_provider_errors_total',
  help: 'Total API errors by external provider',
  labelNames: ['provider'],
  registers: [register],
});
