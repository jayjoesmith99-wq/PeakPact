import assert from 'node:assert/strict';
import test from 'node:test';

import { shouldUseLocalVerificationFallback } from '../src/services/voiceService';

test('classifies Supabase non-2xx Edge Function responses as recoverable verification outages', () => {
  assert.equal(shouldUseLocalVerificationFallback('Edge Function returned a non-2xx status code'), true);
  assert.equal(shouldUseLocalVerificationFallback('Authentication required'), false);
});