import { and, eq } from 'drizzle-orm';
import type { Logger } from 'pino';
import type { Db } from '../db/client.js';
import { identities, recipeKnowledge, starterGrants, users, type UserRow } from '../db/schema.js';
import type { Pricing } from '../domain/pricing.js';
import { identityHash, type AppleTokenService, type Provider, type SecretBox, type VerifiedIdentity } from './auth.js';
import { grantCredits } from './credits.js';

export interface UserView {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  sharingOptIn: boolean;
  providers: Provider[];
  createdAt: string;
}

export async function getUser(db: Db, userId: string): Promise<UserRow | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user;
}

export async function toUserView(db: Db, user: UserRow): Promise<UserView> {
  const linked = await db.select({ provider: identities.provider }).from(identities).where(eq(identities.userId, user.id));
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    sharingOptIn: user.sharingOptIn,
    providers: linked.map((row) => row.provider as Provider),
    createdAt: user.createdAt.toISOString(),
  };
}

export interface SignInResult {
  user: UserRow;
  isNew: boolean;
  starterCreditsGranted: number;
}

/**
 * Finds or creates the account for a verified identity. New accounts receive the one-time starter
 * credits — unless this identity already claimed them on a previously deleted account.
 */
export async function signInWithIdentity(
  db: Db,
  pricing: Pricing,
  identity: VerifiedIdentity,
  extras: { appleRefreshToken?: string | null; box: SecretBox },
): Promise<SignInResult> {
  const sealedAppleToken = extras.appleRefreshToken ? extras.box.seal(extras.appleRefreshToken) : null;

  const { user, isNew } = await db.transaction(async (tx) => {
    const [link] = await tx
      .select()
      .from(identities)
      .where(and(eq(identities.provider, identity.provider), eq(identities.subject, identity.subject)));

    if (link) {
      const [current] = await tx.select().from(users).where(eq(users.id, link.userId));
      if (!current) throw new Error(`identity ${identity.provider} points at a missing user`);
      const [updated] = await tx
        .update(users)
        .set({
          email: identity.email ?? current.email,
          name: current.name ?? identity.name,
          avatarUrl: identity.avatarUrl ?? current.avatarUrl,
          lastSeenAt: new Date(),
        })
        .where(eq(users.id, current.id))
        .returning();
      if (sealedAppleToken || identity.email) {
        await tx
          .update(identities)
          .set({
            email: identity.email ?? link.email,
            ...(sealedAppleToken ? { appleRefreshToken: sealedAppleToken } : {}),
          })
          .where(and(eq(identities.provider, identity.provider), eq(identities.subject, identity.subject)));
      }
      return { user: updated ?? current, isNew: false };
    }

    const [created] = await tx
      .insert(users)
      .values({ email: identity.email, name: identity.name, avatarUrl: identity.avatarUrl, lastSeenAt: new Date() })
      .returning();
    if (!created) throw new Error('failed to create user');
    await tx.insert(identities).values({
      provider: identity.provider,
      subject: identity.subject,
      userId: created.id,
      email: identity.email,
      appleRefreshToken: sealedAppleToken,
    });
    return { user: created, isNew: true };
  });

  let starterCreditsGranted = 0;
  if (isNew && pricing.starterCredits > 0) {
    const firstClaim = await db
      .insert(starterGrants)
      .values({ identityHash: identityHash(identity.provider, identity.subject) })
      .onConflictDoNothing()
      .returning();
    if (firstClaim.length > 0) {
      const granted = await grantCredits(db, {
        userId: user.id,
        bucket: 'bonus',
        amount: pricing.starterCredits,
        reason: 'starter',
        idempotencyKey: `starter:${user.id}`,
      });
      if (granted) starterCreditsGranted = pricing.starterCredits;
    }
  }

  const fresh = (await getUser(db, user.id)) ?? user;
  return { user: fresh, isNew, starterCreditsGranted };
}

export async function updateUser(db: Db, userId: string, patch: { name?: string; sharingOptIn?: boolean }): Promise<UserRow> {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(users)
      .set({
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.sharingOptIn !== undefined ? { sharingOptIn: patch.sharingOptIn } : {}),
      })
      .where(eq(users.id, userId))
      .returning();
    if (!updated) throw new Error('user not found');
    if (patch.sharingOptIn !== undefined) {
      // Opting out immediately withdraws this cook's contributions from the shared knowledge base.
      await tx.update(recipeKnowledge).set({ shared: patch.sharingOptIn }).where(eq(recipeKnowledge.userId, userId));
    }
    return updated;
  });
}

/**
 * Permanently deletes the account and everything linked to it (ledger, jobs, knowledge contributions).
 * Sign in with Apple grants are revoked first, as the App Store requires.
 */
export async function deleteAccount(
  db: Db,
  userId: string,
  deps: { apple: AppleTokenService | null; appleClientIds: string[]; box: SecretBox; logger: Logger },
): Promise<void> {
  const linked = await db.select().from(identities).where(eq(identities.userId, userId));
  const clientId = deps.appleClientIds[0];
  for (const identity of linked) {
    if (identity.provider !== 'apple' || !identity.appleRefreshToken || !deps.apple || !clientId) continue;
    const token = deps.box.open(identity.appleRefreshToken);
    if (!token) continue;
    try {
      await deps.apple.revoke(token, clientId);
    } catch (error) {
      deps.logger.warn({ err: error }, 'apple token revocation failed');
    }
  }
  await db.delete(users).where(eq(users.id, userId));
}
