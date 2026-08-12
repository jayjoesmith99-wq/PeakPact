import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExecutionCoachSnapshot } from '../services/aiExecutionCoach';
import type { FutureSelfSnapshot } from '../services/futureSelfEngine';
import type { TransformationReport } from '../services/transformationReports';

type ExecutiveDashboardProps = {
  coach: ExecutionCoachSnapshot;
  future: FutureSelfSnapshot;
  transformationDayCount: number;
  todaysMission: string;
  squadRank: string;
  monthlyReport: TransformationReport;
  annualReport: TransformationReport;
  onShareReport: (report: TransformationReport) => void;
};

function ScoreCard({ label, value }: { label: string; value: number }) {
  const tone = value >= 85 ? styles.scoreValueElite : value >= 70 ? styles.scoreValueHigh : styles.scoreValueBase;

  return (
    <View style={styles.scoreCard}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={[styles.scoreValue, tone]}>{value}</Text>
      <View style={styles.scoreTrack}>
        <View style={[styles.scoreFill, { width: `${Math.max(8, Math.min(100, value))}%` }]} />
      </View>
    </View>
  );
}

function ConfidenceBadge({ band }: { band: 'stable' | 'strong' | 'elite' }) {
  const style = band === 'elite' ? styles.confidenceElite : band === 'strong' ? styles.confidenceStrong : styles.confidenceStable;
  return (
    <View style={[styles.confidenceBadge, style]}>
      <Text style={styles.confidenceText}>{band.toUpperCase()}</Text>
    </View>
  );
}

export default function ExecutiveDashboard({
  coach,
  future,
  transformationDayCount,
  todaysMission,
  squadRank,
  monthlyReport,
  annualReport,
  onShareReport,
}: ExecutiveDashboardProps) {
  const projection30 = future.projections.find((projection) => projection.windowDays === 30);
  const projection90 = future.projections.find((projection) => projection.windowDays === 90);
  const projection365 = future.projections.find((projection) => projection.windowDays === 365);
  const isWeb = Platform.OS === 'web';

  const metrics = [
    { label: 'Discipline', value: coach.disciplineScore },
    { label: 'Consistency', value: coach.consistencyScore },
    { label: 'Focus', value: coach.focusScore },
    { label: 'Recovery', value: coach.recoveryScore },
  ];

  return (
    <View style={[styles.shell, isWeb && styles.shellWeb]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Premium Intelligence</Text>
          <Text style={styles.header}>Executive Command Center</Text>
        </View>
        <View style={styles.dayChip}>
          <Text style={styles.dayChipText}>Day {transformationDayCount}</Text>
        </View>
      </View>

      <Text style={styles.subheader}>{coach.dailyBriefing}</Text>

      <View style={styles.scoreChartCard}>
        <Text style={styles.scoreChartTitle}>Performance Vector</Text>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.chartRow}>
            <Text style={styles.chartLabel}>{metric.label}</Text>
            <View style={styles.chartTrack}>
              <View style={[styles.chartFill, { width: `${Math.max(8, Math.min(100, metric.value))}%` }]} />
            </View>
            <Text style={styles.chartValue}>{metric.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.scoreGrid}>
        {metrics.map((metric) => (
          <ScoreCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </View>

      <View style={styles.cardGrid}>
        <View style={styles.identityCard}>
          <Text style={styles.identityTitle}>Transformation Card</Text>
          <Text style={styles.identityValue}>{coach.currentIdentity}</Text>
          <Text style={styles.identityMeta}>{future.identityNarrative}</Text>
        </View>

        <View style={styles.blockCard}>
          <Text style={styles.blockTitle}>Mission Card</Text>
          <Text style={styles.blockBody}>{todaysMission}</Text>
        </View>

        <View style={styles.blockCard}>
          <Text style={styles.blockTitle}>Squad Card</Text>
          <Text style={styles.blockBody}>{squadRank}</Text>
        </View>

        <View style={styles.blockCard}>
          <Text style={styles.blockTitle}>Focus Window Card</Text>
          <Text style={styles.blockBody}>{projection30?.executionFocus ?? coach.recommendations[0]}</Text>
        </View>
      </View>

      <View style={styles.splitRow}>
        <View style={styles.projectionPillar}>
          <Text style={styles.pillarLabel}>30 Days</Text>
          <Text style={styles.pillarValue}>L{projection30?.projectedLevel ?? '-'}</Text>
          <Text style={styles.pillarMeta}>Streak {projection30?.projectedStreak ?? '-'}</Text>
        </View>
        <View style={styles.projectionPillar}>
          <Text style={styles.pillarLabel}>90 Days</Text>
          <Text style={styles.pillarValue}>L{projection90?.projectedLevel ?? '-'}</Text>
          <Text style={styles.pillarMeta}>Streak {projection90?.projectedStreak ?? '-'}</Text>
        </View>
        <View style={styles.projectionPillar}>
          <Text style={styles.pillarLabel}>365 Days</Text>
          <Text style={styles.pillarValue}>L{projection365?.projectedLevel ?? '-'}</Text>
          <Text style={styles.pillarMeta}>Streak {projection365?.projectedStreak ?? '-'}</Text>
        </View>
      </View>

      <View style={styles.projectionCard}>
        <Text style={styles.projectionTitle}>Future Self Engine</Text>
        <View style={styles.trajectoryBanner}>
          <Text style={styles.trajectoryText}>Signal: {future.trajectorySignal.toUpperCase()}</Text>
        </View>

        {future.projections.map((projection) => (
          <View key={projection.windowDays} style={styles.projectionRowCard}>
            <View style={styles.projectionTopRow}>
              <Text style={styles.projectionWindow}>{projection.windowDays}d</Text>
              <ConfidenceBadge band={projection.confidenceBand} />
            </View>
            <Text style={styles.projectionRow}>Level {projection.projectedLevel}</Text>
            <Text style={styles.projectionRow}>Streak {projection.projectedStreak}</Text>
            <Text style={styles.projectionRow}>Discipline {projection.projectedDisciplineScore}</Text>
            <Text style={styles.projectionRow}>Momentum {projection.momentumIndex}</Text>
            <Text style={styles.projectionShift}>{projection.identityShift}</Text>
            <Text style={styles.projectionFocus}>{projection.executionFocus}</Text>
          </View>
        ))}
      </View>

      <View style={styles.timelineCard}>
        <Text style={styles.timelineTitle}>Transformation Timeline</Text>
        {future.transformationTimeline.map((entry) => (
          <View key={`timeline-${entry.day}`} style={styles.timelineRow}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineHeading}>{entry.title}</Text>
              <Text style={styles.timelineBody}>{entry.summary}</Text>
              <View style={styles.timelineConfidenceWrap}>
                <ConfidenceBadge band={entry.confidenceBand} />
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.recoCard}>
        <Text style={styles.recoTitle}>AI Recommendation Card</Text>
        <Text style={styles.recoBody}>{coach.recommendations[0]}</Text>
      </View>

      <View style={styles.reportPreviewCard}>
        <Text style={styles.reportPreviewTitle}>Transformation Reports</Text>
        <Text style={styles.reportPreviewHeadline}>{monthlyReport.headline}</Text>
        <Text style={styles.reportPreviewSummary}>{monthlyReport.summary}</Text>
        <View style={styles.reportSignalChip}>
          <Text style={styles.reportSignalText}>Signal: {monthlyReport.signal.toUpperCase()}</Text>
        </View>
        <View style={styles.kpiRow}>
          {monthlyReport.kpis.slice(0, 4).map((kpi) => (
            <View key={kpi.label} style={styles.kpiChip}>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.reportRow}>
        <Pressable style={({ pressed }) => [styles.reportButton, pressed && styles.reportButtonPressed]} onPress={() => onShareReport(monthlyReport)}>
          <Text style={styles.reportButtonText}>Share Monthly Report</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.reportButton, pressed && styles.reportButtonPressed]} onPress={() => onShareReport(annualReport)}>
          <Text style={styles.reportButtonText}>Share Annual Report</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 26,
    padding: 18,
    backgroundColor: '#0F141A',
    gap: 14,
    shadowColor: '#050A12',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  shellWeb: {
    padding: 22,
    borderRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: '#8EA4BF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dayChip: {
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.4)',
    backgroundColor: 'rgba(0,255,136,0.1)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dayChipText: {
    color: '#A8FFD6',
    fontWeight: '700',
    fontSize: 11,
  },
  header: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subheader: {
    color: '#B3BEC9',
    lineHeight: 21,
    fontSize: 14,
  },
  scoreChartCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#131A22',
    padding: 12,
  },
  scoreChartTitle: {
    color: '#9EA9B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: 10,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartLabel: {
    width: 82,
    color: '#B5C1CF',
    fontSize: 12,
  },
  chartTrack: {
    flex: 1,
    height: 7,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  chartFill: {
    height: 7,
    borderRadius: 99,
    backgroundColor: '#00FF88',
  },
  chartValue: {
    width: 36,
    textAlign: 'right',
    color: '#D9E4F1',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 8,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  scoreCard: {
    flexBasis: '48%',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#141B23',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scoreLabel: {
    color: '#9EA9B8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 8,
  },
  scoreValueBase: {
    color: '#E8EFF8',
  },
  scoreValueHigh: {
    color: '#6DE7A2',
  },
  scoreValueElite: {
    color: '#00FF88',
  },
  scoreTrack: {
    height: 5,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  scoreFill: {
    height: 5,
    borderRadius: 99,
    backgroundColor: '#00FF88',
  },
  cardGrid: {
    gap: 10,
  },
  identityCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#131A22',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  identityTitle: {
    color: '#98A6B8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  identityValue: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 8,
  },
  identityMeta: {
    color: '#B0BDCC',
    lineHeight: 21,
  },
  blockCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#131A22',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  blockTitle: {
    color: '#9EA9B8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  blockBody: {
    color: '#E5EDF7',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  projectionPillar: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#131A22',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  pillarLabel: {
    color: '#9EA9B8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pillarValue: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  pillarMeta: {
    color: '#9EACBD',
    fontSize: 12,
    marginTop: 2,
  },
  projectionCard: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#141B23',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  projectionTitle: {
    color: '#9EA9B8',
    textTransform: 'uppercase',
    fontSize: 11,
    marginBottom: 8,
    letterSpacing: 1,
  },
  trajectoryBanner: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.4)',
    backgroundColor: 'rgba(0,255,136,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  trajectoryText: {
    color: '#A8FFD6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  projectionRowCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#19212B',
  },
  projectionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectionWindow: {
    color: '#7CD9AA',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  projectionRow: {
    color: '#DEE8F3',
    lineHeight: 19,
    fontSize: 13,
  },
  projectionShift: {
    color: '#9DB0C3',
    fontSize: 12,
    marginTop: 6,
  },
  projectionFocus: {
    color: '#AFC0D2',
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
  },
  confidenceBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  confidenceStable: {
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  confidenceStrong: {
    borderColor: 'rgba(255,200,87,0.5)',
    backgroundColor: 'rgba(255,200,87,0.12)',
  },
  confidenceElite: {
    borderColor: 'rgba(0,255,136,0.5)',
    backgroundColor: 'rgba(0,255,136,0.12)',
  },
  confidenceText: {
    color: '#E7EEF8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  timelineCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#141B23',
  },
  timelineTitle: {
    color: '#9EA9B8',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#00FF88',
    marginTop: 5,
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timelineConfidenceWrap: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  timelineHeading: {
    color: '#EAF1F8',
    fontSize: 13,
    fontWeight: '700',
  },
  timelineBody: {
    color: '#AFC0D2',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  recoCard: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(0,255,136,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.45)',
  },
  recoTitle: {
    color: '#00FF88',
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  recoBody: {
    color: '#E8FFF4',
    lineHeight: 20,
  },
  reportPreviewCard: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#141B23',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  reportPreviewTitle: {
    color: '#9EA9B8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  reportPreviewHeadline: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  reportPreviewSummary: {
    color: '#B3BECA',
    fontSize: 13,
    lineHeight: 19,
  },
  reportSignalChip: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.45)',
    backgroundColor: 'rgba(0,255,136,0.1)',
  },
  reportSignalText: {
    color: '#A8FFD6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  kpiChip: {
    minWidth: 90,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#19212B',
  },
  kpiLabel: {
    color: '#9EA9B8',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  kpiValue: {
    color: '#EFF5FF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  reportRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reportButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#E9EFF6',
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  reportButtonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  reportButtonText: {
    color: '#0F141A',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
