import test from 'node:test';
import assert from 'node:assert/strict';

import { isLiveAuthEnabled, normalizeAuthSession, signInOperator, signUpOperator } from '../src/services/authService';

test('enables live auth when Supabase is configured', () => {
  assert.equal(isLiveAuthEnabled(), true);
});

test('normalizes a Supabase-style session into the app session shape', () => {
  const normalized = normalizeAuthSession({
    user: { id: 'user-1', email: 'operator@peakpact.app' },
    access_token: 'token',
  } as never);

  assert.equal(normalized.user?.id, 'user-1');
  assert.equal(normalized.user?.email, 'operator@peakpact.app');
  assert.equal(normalized.accessToken, 'token');
});

test('returns a structured sign-in result for the configured runtime', async () => {
  const result = await signInOperator({ email: 'operator@peakpact.app', password: 'secret' });

  assert.equal(typeof result.ok, 'boolean');
  assert.equal(typeof result.message, 'string');
});

test('returns a structured sign-up result for the configured runtime', async () => {
  const result = await signUpOperator({
    email: 'operator@peakpact.app',
    password: 'secret',
    codename: 'NOVA',
  });

  assert.equal(typeof result.ok, 'boolean');
  assert.equal(typeof result.message, 'string');
});
