import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildShareCard } from '../src/services/shareCards';
import type { TransformationReport } from '../src/services/transformationReports';

const report: TransformationReport = {
  period: 'monthly',
  headline: 'Private operator report',
  summary: 'Private summary must not be shared.',
  highlights: ['Private mission text'],
  shareText: 'Private report text',
  signal: 'ascending',
  kpis: [
    { label: 'Discipline', value: '82/100' },
    { label: 'Focus', value: '76/100' },
    { label: 'Level', value: 'L8' },
  ],
  strategicMemo: 'Private memo',
};

describe('share cards', () => {
  it('builds a share-safe aggregate card without private report content', () => {
    const card = buildShareCard(report, 'en');

    assert.equal(card.title, 'PeakPact');
    assert.equal(card.stats.length, 3);
    assert.match(card.message, /Discipline: 82\/100/);
    assert.match(card.message, /Signal: ASCENDING/);
    assert.doesNotMatch(card.message, /Private/);
    assert.doesNotMatch(card.message, /mission text/i);
  });
});
