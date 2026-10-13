import { router, type Href } from 'expo-router';
import { useSession } from '@/state/session';
import { ApiError } from './api';
import { toast } from '@/state/toast';

/** AI features need an account: guests are sent to sign-in, then on to where they were going. */
export function withAccount(next: string, go?: () => void) {
  if (useSession.getState().status === 'signedIn') {
    if (go) go();
    else router.push(next as Href);
    return;
  }
  router.push({ pathname: '/sign-in', params: { next } });
}

/** Shared handling for API failures in AI flows. Returns true when the error was handled. */
export function handleApiError(error: unknown, fallback = 'Something went wrong. Please try again.'): void {
  if (error instanceof ApiError) {
    if (error.code === 'insufficient_credits') {
      router.push({ pathname: '/pricing', params: { reason: 'credits' } });
      return;
    }
    if (error.code === 'unauthorized') {
      router.push('/sign-in');
      return;
    }
    toast(error.message, { tone: 'error', durationMs: 4500 });
    return;
  }
  toast(error instanceof Error ? error.message : fallback, { tone: 'error', durationMs: 4500 });
}
