import type { TransformationReport } from './transformationReports';
import type { SupportedLanguage } from './i18n';
import { formatLocalizedText, getLocalizedText } from './i18n';

export type ShareCard = {
  title: string;
  subtitle: string;
  badge: string;
  stats: Array<{ label: string; value: string }>;
  message: string;
};

export function buildShareCard(report: TransformationReport, language: SupportedLanguage): ShareCard {
  const periodLabel = report.period === 'monthly'
    ? getLocalizedText('dashboardShareMonthly', language)
    : getLocalizedText('dashboardShareAnnual', language);
  const signal = report.signal === 'dominant'
    ? getLocalizedText('futureNarrativeDominant', language)
    : report.signal === 'ascending'
      ? getLocalizedText('futureNarrativeAscending', language)
      : getLocalizedText('futureNarrativeRecovering', language);

  const stats = report.kpis.slice(0, 3);
  const statText = stats.map((stat) => `${stat.label}: ${stat.value}`).join(' | ');
  const message = [
    'PeakPact',
    periodLabel,
    statText,
    `${getLocalizedText('dashboardSignal', language)}: ${report.signal.toUpperCase()}`,
  ].filter(Boolean).join('\n');

  return {
    title: 'PeakPact',
    subtitle: periodLabel,
    badge: formatLocalizedText('futureTimelineTitle', { day: report.period === 'monthly' ? 30 : 365, identityShift: signal }, language),
    stats,
    message,
  };
}
