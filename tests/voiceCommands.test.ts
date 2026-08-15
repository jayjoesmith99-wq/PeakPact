import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseVoiceCommand } from '../src/services/voiceCommands';

describe('voice command parsing', () => {
  it('extracts mission duration and stake for confirmation', () => {
    const command = parseVoiceCommand('Start a focused study mission for 30 minutes with 15 PP');

    assert.equal(command.task, 'a focused study');
    assert.equal(command.duration, '30');
    assert.equal(command.stake, '15');
    assert.equal(command.requiresConfirmation, true);
  });

  it('keeps ordinary voice proof optional and does not require confirmation', () => {
    const command = parseVoiceCommand('I completed my workout');

    assert.equal(command.task, 'I completed my workout');
    assert.equal(command.duration, undefined);
    assert.equal(command.stake, undefined);
    assert.equal(command.requiresConfirmation, false);
  });
});
