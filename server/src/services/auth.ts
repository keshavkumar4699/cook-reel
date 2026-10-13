import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import {
  createRemoteJWKSet,
  errors as joseErrors,
  importPKCS8,
  jwtVerify,
  SignJWT,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';
import { HttpError } from '../lib/errors.js';

export type Provider = 'google' | 'apple' | 'dev';

export interface VerifiedIdentity {
  provider: Provider;
  subject: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

/* ------------------------------------------------------------------------------------------------
 * Session tokens (our own JWTs).
 * ---------------------------------------------------------------------------------------------- */

const SESSION_ISSUER = 'cookreel';
const SESSION_AUDIENCE = 'cookreel-app';

export interface SessionSigner {
  sign(userId: string): Promise<{ token: string; expiresAt: string }>;
  verify(token: string): Promise<{ userId: string; issuedAt: number }>;
}

export function createSessionSigner(secret: string, ttlDays: number): SessionSigner {
  const key = new TextEncoder().encode(secret);
  return {
    async sign(userId) {
      const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
      const token = await new SignJWT({})
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setSubject(userId)
        .setIssuer(SESSION_ISSUER)
        .setAudience(SESSION_AUDIENCE)
        .setIssuedAt()
        .setExpirationTime(expiresAt)
        .sign(key);
      return { token, expiresAt: expiresAt.toISOString() };
    },
    async verify(token) {
      try {
        const { payload } = await jwtVerify(token, key, {
          issuer: SESSION_ISSUER,
          audience: SESSION_AUDIENCE,
          algorithms: ['HS256'],
        });
        if (!payload.sub) throw new Error('missing subject');
        return { userId: payload.sub, issuedAt: payload.iat ?? 0 };
      } catch {
        throw new HttpError(401, 'unauthorized', 'Your session has expired. Please sign in again.');
      }
    },
  };
}

/* ------------------------------------------------------------------------------------------------
 * Third-party identity tokens.
 * ---------------------------------------------------------------------------------------------- */

export interface IdentityVerifier {
  google(idToken: string): Promise<VerifiedIdentity>;
  apple(identityToken: string, fullName?: string | null): Promise<VerifiedIdentity>;
}

export interface IdentityVerifierOptions {
  googleClientIds: string[];
  appleAudiences: string[];
  /** Injected in tests; defaults to the providers' published key sets. */
  googleKeys?: JWTVerifyGetKey;
  appleKeys?: JWTVerifyGetKey;
}

const invalidToken = (provider: string) =>
  new HttpError(401, 'unauthorized', `We couldn't verify your ${provider} sign-in. Please try again.`);

export function createIdentityVerifier(options: IdentityVerifierOptions): IdentityVerifier {
  const googleKeys = options.googleKeys ?? createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
  const appleKeys = options.appleKeys ?? createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

  async function verify(token: string, keys: JWTVerifyGetKey, issuer: string[], audience: string[], provider: string) {
    if (!audience.length) {
      throw new HttpError(503, 'not_configured', `${provider} sign-in isn't configured on this server yet.`);
    }
    try {
      const { payload } = await jwtVerify(token, keys, { issuer, audience, algorithms: ['RS256', 'ES256'] });
      return payload;
    } catch (error) {
      if (error instanceof joseErrors.JOSEError) throw invalidToken(provider);
      throw error;
    }
  }

  return {
    async google(idToken) {
      const payload = await verify(
        idToken,
        googleKeys,
        ['https://accounts.google.com', 'accounts.google.com'],
        options.googleClientIds,
        'Google',
      );
      const claims = payload as JWTPayload & { email?: string; email_verified?: boolean; name?: string; picture?: string };
      if (!claims.sub) throw invalidToken('Google');
      return {
        provider: 'google',
        subject: claims.sub,
        email: claims.email && claims.email_verified !== false ? claims.email : null,
        name: claims.name ?? null,
        avatarUrl: claims.picture ?? null,
      };
    },
    async apple(identityToken, fullName) {
      const payload = await verify(identityToken, appleKeys, ['https://appleid.apple.com'], options.appleAudiences, 'Apple');
      const claims = payload as JWTPayload & { email?: string };
      if (!claims.sub) throw invalidToken('Apple');
      return {
        provider: 'apple',
        subject: claims.sub,
        email: claims.email ?? null,
        // Apple only shares the user's name with the app, once, on first sign-in.
        name: fullName?.trim() || null,
        avatarUrl: null,
      };
    },
  };
}

/* ------------------------------------------------------------------------------------------------
 * Sign in with Apple token revocation (required by App Store guideline 5.1.1(v) on account deletion).
 * ---------------------------------------------------------------------------------------------- */

export interface AppleTokenService {
  /** Exchanges the one-time authorization code for a refresh token (null if not configured/failed). */
  exchangeCode(authorizationCode: string, clientId: string): Promise<string | null>;
  revoke(refreshToken: string, clientId: string): Promise<void>;
}

export function createAppleTokenService(config: { teamId: string; keyId: string; privateKey: string } | null): AppleTokenService | null {
  if (!config) return null;
  const clientSecret = async (clientId: string) => {
    const key = await importPKCS8(config.privateKey, 'ES256');
    return new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: config.keyId })
      .setIssuer(config.teamId)
      .setSubject(clientId)
      .setAudience('https://appleid.apple.com')
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(key);
  };
  return {
    async exchangeCode(code, clientId) {
      const res = await fetch('https://appleid.apple.com/auth/token', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: await clientSecret(clientId),
          code,
          grant_type: 'authorization_code',
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) return null;
      const body = (await res.json()) as { refresh_token?: string };
      return body.refresh_token ?? null;
    },
    async revoke(refreshToken, clientId) {
      await fetch('https://appleid.apple.com/auth/revoke', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: await clientSecret(clientId),
          token: refreshToken,
          token_type_hint: 'refresh_token',
        }),
        signal: AbortSignal.timeout(10_000),
      });
    },
  };
}

/* ------------------------------------------------------------------------------------------------
 * Small crypto helpers.
 * ---------------------------------------------------------------------------------------------- */

/** AES-256-GCM with a key derived from the server secret. Used for third-party tokens at rest. */
export function createSecretBox(secret: string) {
  const key = createHash('sha256').update(`cookreel:secret-box:${secret}`).digest();
  return {
    seal(plaintext: string): string {
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
      return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64url')).join('.');
    },
    open(sealed: string): string | null {
      try {
        const [iv, tag, data] = sealed.split('.').map((part) => Buffer.from(part, 'base64url'));
        if (!iv || !tag || !data) return null;
        const decipher = createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
      } catch {
        return null;
      }
    },
  };
}
export type SecretBox = ReturnType<typeof createSecretBox>;

/**
 * Stable, non-reversible identifier for an identity (used to remember starter-credit grants after an
 * account is deleted). Deliberately independent of server secrets so rotating them can't reset grants.
 */
export function identityHash(provider: Provider, subject: string): string {
  return createHash('sha256').update(`cookreel:starter-grant:${provider}:${subject}`).digest('hex');
}
