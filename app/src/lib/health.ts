import { api, type Health } from './api';

let healthy: Health | null = null;
let pending: Promise<Health | null> | null = null;
let failedAt = 0;

/**
 * The server's /health, fetched once per launch. A failed check (offline, server waking up) is
 * retried after 30 seconds instead of being remembered for the whole session.
 */
export function fetchHealth(): Promise<Health | null> {
  if (healthy) return Promise.resolve(healthy);
  if (pending) return pending;
  if (Date.now() - failedAt < 30_000) return Promise.resolve(null);
  pending = api
    .health()
    .then((health) => (healthy = health))
    .catch(() => {
      failedAt = Date.now();
      return null;
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}
