/* ═══════════════════════════════════════════════
   FISS Report PDF Template — FinApply.ai
   Server-side PDF generation via @react-pdf/renderer
   ═══════════════════════════════════════════════ */

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { DimensionScore } from '@/lib/types';

interface ReportPdfProps {
  candidateName: string;
  college: string;
  totalScore: number;
  percentile: string;
  evaluatorSummary: string;
  financialReasoning: DimensionScore;
  structuredThinking: DimensionScore;
  riskIdentification: DimensionScore;
  decisionClarity: DimensionScore;
  standoutStrength: string;
  criticalGap: string;
  reportDate: string;
  reportUrl: string;
}

const GRADE_COLOR: Record<string, string> = {
  'Strong': '#16A34A',
  'Adequate': '#D97706',
  'Developing': '#EA580C',
  'Critical Gap': '#DC2626',
};

const scoreColor = (score: number) => {
  if (score >= 80) return '#16A34A';
  if (score >= 60) return '#2563EB';
  if (score >= 40) return '#D97706';
  return '#DC2626';
};

const s = StyleSheet.create({
  page: { backgroundColor: '#000000', padding: 40, fontFamily: 'Helvetica' },
  // Cover
  coverCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 8, fontWeight: 'bold', color: '#666666', letterSpacing: 3, marginBottom: 16 },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  scoreBig: { fontSize: 42, fontWeight: 'bold', color: '#ffffff' },
  scoreMax: { fontSize: 10, color: '#666666', marginTop: 2 },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginTop: 20 },
  subText: { fontSize: 11, color: '#666666', marginTop: 6 },
  // Summary
  summaryQuote: { fontSize: 14, fontWeight: 'bold', color: '#ffffff', lineHeight: 1.5, fontStyle: 'italic', marginBottom: 8 },
  percentileText: { fontSize: 10, color: '#888888', marginTop: 8 },
  divider: { height: 1, backgroundColor: '#1a1a1a', marginVertical: 24 },
  // Dimensions
  dimGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  dimCard: { width: '48%', backgroundColor: '#0a0a0a', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#1a1a1a', marginBottom: 10 },
  dimHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  dimName: { fontSize: 10, fontWeight: 'bold', color: '#ffffff' },
  dimScore: { fontSize: 10, fontWeight: 'bold', color: '#ffffff' },
  gradeBadge: { fontSize: 8, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 6 },
  dimRationale: { fontSize: 8, color: '#999999', lineHeight: 1.4, marginBottom: 6 },
  evidenceBox: { backgroundColor: '#111111', borderLeftWidth: 2, borderLeftColor: '#333333', padding: 6, borderRadius: 4, marginBottom: 6 },
  evidenceText: { fontSize: 7, color: '#777777', fontStyle: 'italic' },
  improvLabel: { fontSize: 7, fontWeight: 'bold', color: '#555555', letterSpacing: 2, marginBottom: 3 },
  improvText: { fontSize: 8, color: '#999999', lineHeight: 1.4 },
  // Insight cards
  insightCard: { borderLeftWidth: 3, borderRadius: 6, padding: 14, marginBottom: 10 },
  insightLabel: { fontSize: 8, fontWeight: 'bold', letterSpacing: 2, marginBottom: 6 },
  insightBody: { fontSize: 9, color: '#bbbbbb', lineHeight: 1.5 },
  // Footer
  footer: { borderTopWidth: 1, borderTopColor: '#1a1a1a', paddingTop: 16, alignItems: 'center', marginTop: 'auto' },
  footerText: { fontSize: 7, color: '#444444', marginBottom: 3 },
});

function DimCard({ name, dim }: { name: string; dim: DimensionScore }) {
  const gc = GRADE_COLOR[dim.grade] || '#D97706';
  return (
    <View style={s.dimCard}>
      <View style={s.dimHeader}>
        <Text style={s.dimName}>{name}</Text>
        <Text style={s.dimScore}>{dim.score}/25</Text>
      </View>
      <Text style={[s.gradeBadge, { color: gc, backgroundColor: gc + '20' }]}>{dim.grade}</Text>
      <Text style={s.dimRationale}>{dim.rationale}</Text>
      <View style={s.evidenceBox}>
        <Text style={s.evidenceText}>{dim.evidence}</Text>
      </View>
      <Text style={s.improvLabel}>TO IMPROVE</Text>
      <Text style={s.improvText}>{dim.improvement}</Text>
    </View>
  );
}

export default function FissReportPdf(props: ReportPdfProps) {
  const sc = scoreColor(props.totalScore);

  return (
    <Document>
      {/* Page 1 — Cover */}
      <Page size="A4" style={s.page}>
        <View style={s.coverCenter}>
          <Text style={s.label}>FINANCIAL INTELLIGENCE SIMULATION SCORE</Text>
          <View style={[s.scoreCircle, { borderColor: sc }]}>
            <Text style={s.scoreBig}>{props.totalScore}</Text>
            <Text style={s.scoreMax}>/ 100</Text>
          </View>
          <Text style={[s.percentileText, { marginBottom: 4 }]}>{props.percentile}</Text>
          <Text style={s.nameText}>{props.candidateName}</Text>
          <Text style={s.subText}>{props.college} · Founding Cohort · Batch 1</Text>
          <Text style={[s.subText, { marginTop: 4 }]}>{props.reportDate}</Text>
        </View>
        <Text style={{ fontSize: 8, color: '#333333', textAlign: 'center' }}>FinApply.ai</Text>
      </Page>

      {/* Page 2 — Summary + Dimensions */}
      <Page size="A4" style={s.page}>
        <Text style={s.label}>EVALUATOR SUMMARY</Text>
        <Text style={s.summaryQuote}>&ldquo;{props.evaluatorSummary}&rdquo;</Text>
        <View style={s.divider} />
        <Text style={[s.label, { marginBottom: 12 }]}>DIMENSION BREAKDOWN</Text>
        <View style={s.dimGrid}>
          <DimCard name="Financial Reasoning" dim={props.financialReasoning} />
          <DimCard name="Structured Thinking" dim={props.structuredThinking} />
          <DimCard name="Risk Identification" dim={props.riskIdentification} />
          <DimCard name="Decision Clarity" dim={props.decisionClarity} />
        </View>
      </Page>

      {/* Page 3 — Insights + Footer */}
      <Page size="A4" style={s.page}>
        <View style={[s.insightCard, { borderLeftColor: '#16A34A', backgroundColor: '#16A34A10' }]}>
          <Text style={[s.insightLabel, { color: '#16A34A' }]}>STANDOUT STRENGTH</Text>
          <Text style={s.insightBody}>{props.standoutStrength}</Text>
        </View>
        <View style={[s.insightCard, { borderLeftColor: '#D97706', backgroundColor: '#D9770610' }]}>
          <Text style={[s.insightLabel, { color: '#D97706' }]}>CRITICAL GAP</Text>
          <Text style={s.insightBody}>{props.criticalGap}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.footer}>
          <Text style={s.footerText}>This report was generated by FinApply.ai · FISS Score v1.0</Text>
          <Text style={s.footerText}>Evaluated by human + AI collaboration · Not a guarantee of employment outcomes</Text>
          <Text style={[s.footerText, { marginTop: 8, color: '#2563EB' }]}>View interactive report: {props.reportUrl}</Text>
        </View>
      </Page>
    </Document>
  );
}
