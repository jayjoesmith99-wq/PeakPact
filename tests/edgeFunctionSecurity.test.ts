import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const transcribeSource = readFileSync('supabase/functions/transcribe-audio/index.ts', 'utf8');
const verifySource = readFileSync('supabase/functions/peakpact-verify/index.ts', 'utf8');
const deleteAccountSource = readFileSync('supabase/functions/delete-account/index.ts', 'utf8');
const realtimeTokenSource = readFileSync('supabase/functions/realtime-token/index.ts', 'utf8');

describe('edge function security contract', () => {
  it('requires authentication for audio transcription', () => {
    assert.match(transcribeSource, /getAuthenticatedUser\(req\)/);
    assert.match(transcribeSource, /Authentication required/);
    assert.match(transcribeSource, /Audio payload type is required/);
    assert.match(transcribeSource, /4096 characters/);
  });

  it('requires authentication and hides internal verification details', () => {
    assert.match(verifySource, /getAuthenticatedUser\(req\)/);
    assert.match(verifySource, /User identity mismatch/);
    assert.doesNotMatch(verifySource, /system_prompt/);
    assert.match(verifySource, /Verification content is required/);
    assert.match(verifySource, /A valid createdAt timestamp is required/);
    assert.match(verifySource, /Contract duration must be an integer/);
    assert.match(verifySource, /Contract stake must be an integer/);
  });

  it('requires authentication and keeps the service role on the server for deletion', () => {
    assert.match(deleteAccountSource, /getAuthenticatedUser\(req\)/);
    assert.match(deleteAccountSource, /SUPABASE_SERVICE_ROLE_KEY/);
    assert.match(deleteAccountSource, /admin\.auth\.admin\.deleteUser\(user\.id\)/);
  });

  it('requires authentication and brokers only a short-lived Realtime client secret', () => {
    assert.match(realtimeTokenSource, /getAuthenticatedUser\(req\)/);
    assert.match(realtimeTokenSource, /OPENAI_API_KEY/);
    assert.match(realtimeTokenSource, /realtime\/client_secrets/);
    assert.match(realtimeTokenSource, /gpt-realtime/);
    assert.match(realtimeTokenSource, /Authentication required/);
  });
});
