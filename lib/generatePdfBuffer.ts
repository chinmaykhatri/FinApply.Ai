/* ═══════════════════════════════════════════════
   FISS Report PDF Generator — Server-Side
   Returns a Buffer for email attachments and API downloads.
   Mirrors the client-side generator's visual design.
   ═══════════════════════════════════════════════ */

import { jsPDF } from 'jspdf';
import type { DimensionScore } from './types';

export interface ServerReportData {
  total_score: number;
  percentile: string;
  financial_reasoning: DimensionScore;
  structured_thinking: DimensionScore;
  risk_identification: DimensionScore;
  decision_clarity: DimensionScore;
  standout_strength: string;
  critical_gap: string;
  evaluator_summary: string;
  employer_summary?: string;
}

export interface ServerPdfOptions {
  candidateName: string;
  candidateCollege: string;
  report: ServerReportData;
  shareId?: string;
}

/* ── Color helpers ─────────────────────────── */
const hexToRgb = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

const mixColor = (
  fg: [number, number, number],
  bg: [number, number, number],
  opacity: number
): [number, number, number] => [
  Math.round(bg[0] + (fg[0] - bg[0]) * opacity),
  Math.round(bg[1] + (fg[1] - bg[1]) * opacity),
  Math.round(bg[2] + (fg[2] - bg[2]) * opacity),
];

const gradeColor = (grade: string): string => {
  switch (grade) {
    case 'Strong': return '#16A34A';
    case 'Adequate': return '#2563EB';
    case 'Developing': return '#D97706';
    case 'Critical Gap': return '#DC2626';
    default: return '#2563EB';
  }
};

const overallGradeColor = (score: number): string => {
  if (score >= 80) return '#16A34A';
  if (score >= 60) return '#2563EB';
  if (score >= 40) return '#D97706';
  return '#DC2626';
};

const BG: [number, number, number] = [8, 8, 12];

/* ── Main generator — returns Buffer ──────── */
export function generateFissReportBuffer({ candidateName, candidateCollege, report, shareId }: ServerPdfOptions): Buffer {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 0;

  const themeColor = overallGradeColor(report.total_score);
  const [themeR, themeG, themeB] = hexToRgb(themeColor);
  const themeRgb: [number, number, number] = [themeR, themeG, themeB];

  const addDarkPage = () => {
    pdf.addPage();
    pdf.setFillColor(...BG);
    pdf.rect(0, 0, pageW, pageH, 'F');
    pdf.setDrawColor(themeR, themeG, themeB);
    pdf.setLineWidth(0.5);
    pdf.line(margin, 12, pageW - margin, 12);
    y = 20;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 20) {
      addDarkPage();
    }
  };

  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text, maxWidth);
  };

  /* ═══════════════════════════════════════════
     PAGE 1: Header + Score + Summary
     ═══════════════════════════════════════════ */

  pdf.setFillColor(...BG);
  pdf.rect(0, 0, pageW, pageH, 'F');

  // Top accent bar
  pdf.setFillColor(themeR, themeG, themeB);
  pdf.rect(0, 0, pageW, 3, 'F');

  // Branding
  y = 18;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.text('FinApply.ai', margin, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 130);
  pdf.text('FISS Report v1.0', pageW - margin, y, { align: 'right' });

  y += 6;
  pdf.setDrawColor(40, 40, 50);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageW - margin, y);

  // Section label
  y += 16;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(themeR, themeG, themeB);
  pdf.text('FINANCIAL INTELLIGENCE SIMULATION SCORE', pageW / 2, y, { align: 'center' });

  // Score circle
  y += 18;
  const circleX = pageW / 2;
  const circleY = y;
  const radius = 18;

  pdf.setDrawColor(themeR, themeG, themeB);
  pdf.setLineWidth(2.5);
  pdf.circle(circleX, circleY, radius);

  pdf.setDrawColor(40, 40, 50);
  pdf.setLineWidth(0.3);
  pdf.circle(circleX, circleY, radius - 4);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(32);
  pdf.setTextColor(255, 255, 255);
  pdf.text(String(report.total_score), circleX, circleY + 4, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 110);
  pdf.text('/ 100', circleX, circleY + 12, { align: 'center' });

  // Percentile badge
  y = circleY + radius + 10;
  const percentileText = report.percentile;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  const ptW = pdf.getTextWidth(percentileText) + 12;
  const ptX = (pageW - ptW) / 2;

  const badgeBg = mixColor(themeRgb, BG, 0.15);
  pdf.setFillColor(...badgeBg);
  pdf.roundedRect(ptX, y - 4, ptW, 10, 5, 5, 'F');

  pdf.setDrawColor(themeR, themeG, themeB);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(ptX, y - 4, ptW, 10, 5, 5, 'S');

  pdf.setTextColor(themeR, themeG, themeB);
  pdf.setFontSize(9);
  pdf.text(percentileText, pageW / 2, y + 2.5, { align: 'center' });

  // Candidate name
  y += 18;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);
  pdf.text(candidateName, pageW / 2, y, { align: 'center' });

  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(120, 120, 130);
  pdf.text(candidateCollege, pageW / 2, y, { align: 'center' });

  // Percentile placeholder
  y += 7;
  pdf.setFontSize(8);
  pdf.setTextColor(themeR, themeG, themeB);
  pdf.text('COHORT PERCENTILE', pageW / 2 - 20, y, { align: 'center' });
  pdf.setTextColor(100, 100, 110);
  pdf.setFont('helvetica', 'italic');
  pdf.text(' \u00B7 Available after Batch 1 completion (25+ candidates)', pageW / 2 + 18, y, { align: 'center' });
  pdf.setFont('helvetica', 'normal');

  // Live score URL
  if (shareId) {
    y += 7;
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 110);
    pdf.text('Live Score:', pageW / 2 - 18, y, { align: 'right' });
    pdf.setTextColor(37, 99, 235);
    pdf.textWithLink(`finapply.ai/score/${shareId}`, pageW / 2 - 16, y, {
      url: `https://fin-apply-ai.vercel.app/score/${shareId}`,
    });
  }

  // Separator
  y += 12;
  pdf.setDrawColor(40, 40, 50);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageW - margin, y);

  // Evaluator Summary
  y += 14;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 130);
  pdf.text('EVALUATOR SUMMARY', margin, y);

  y += 8;
  const summaryLines = wrapText(report.evaluator_summary, contentW - 20, 11);
  const summaryBoxH = summaryLines.length * 5.5 + 10;

  pdf.setFillColor(themeR, themeG, themeB);
  pdf.rect(margin, y - 2, 2, summaryBoxH, 'F');

  pdf.setFillColor(20, 20, 28);
  pdf.roundedRect(margin + 4, y - 4, contentW - 4, summaryBoxH + 2, 3, 3, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  const quoteColor = mixColor(themeRgb, [20, 20, 28], 0.3);
  pdf.setTextColor(...quoteColor);
  pdf.text('\u201C', margin + 8, y + 6);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(11);
  pdf.setTextColor(230, 230, 235);
  summaryLines.forEach((line: string, i: number) => {
    pdf.text(line, margin + 10, y + 6 + i * 5.5);
  });

  /* ═══════════════════════════════════════════
     DIMENSION BREAKDOWN
     ═══════════════════════════════════════════ */
  y += summaryBoxH + 14;
  ensureSpace(140);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 130);
  pdf.text('DIMENSION BREAKDOWN', margin, y);
  y += 8;

  const dims: { name: string; data: DimensionScore }[] = [
    { name: 'Financial Reasoning', data: report.financial_reasoning },
    { name: 'Structured Thinking', data: report.structured_thinking },
    { name: 'Risk Identification', data: report.risk_identification },
    { name: 'Decision Clarity', data: report.decision_clarity },
  ];

  const colW = (contentW - 8) / 2;
  const cardPadding = 6;

  for (let i = 0; i < dims.length; i += 2) {
    const row = [dims[i], dims[i + 1]].filter(Boolean);

    let maxCardH = 0;
    const cardHeights: number[] = [];
    row.forEach((dim) => {
      const rationaleLines = wrapText(dim.data.rationale, colW - cardPadding * 2 - 2, 8);
      const evidenceLines = wrapText(dim.data.evidence, colW - cardPadding * 2 - 6, 7.5);
      const improvementLines = wrapText(dim.data.improvement, colW - cardPadding * 2 - 2, 7.5);
      const h = 12 + 8 + 10 + rationaleLines.length * 4 + 6 + evidenceLines.length * 3.5 + 8 + improvementLines.length * 3.5 + 8;
      cardHeights.push(h);
      if (h > maxCardH) maxCardH = h;
    });

    ensureSpace(maxCardH + 10);
    const rowStartY = y;

    row.forEach((dim, colIdx) => {
      const cardX = margin + colIdx * (colW + 8);
      let cardY = rowStartY;

      const rationaleLines = wrapText(dim.data.rationale, colW - cardPadding * 2 - 2, 8);
      const evidenceLines = wrapText(dim.data.evidence, colW - cardPadding * 2 - 6, 7.5);
      const improvementLines = wrapText(dim.data.improvement, colW - cardPadding * 2 - 2, 7.5);

      const gc = gradeColor(dim.data.grade);
      const [gR, gG, gB] = hexToRgb(gc);
      const gRgb: [number, number, number] = [gR, gG, gB];

      pdf.setFillColor(16, 16, 22);
      pdf.setDrawColor(35, 35, 45);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(cardX, cardY, colW, cardHeights[colIdx], 3, 3, 'FD');

      cardY += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text(dim.name, cardX + cardPadding, cardY);

      pdf.setTextColor(200, 200, 210);
      pdf.text(`${dim.data.score}/25`, cardX + colW - cardPadding, cardY, { align: 'right' });

      cardY += 5;
      const barW = colW - cardPadding * 2;
      const barH = 2.5;
      pdf.setFillColor(30, 30, 40);
      pdf.roundedRect(cardX + cardPadding, cardY, barW, barH, 1, 1, 'F');
      const filledW = (dim.data.score / 25) * barW;
      pdf.setFillColor(gR, gG, gB);
      pdf.roundedRect(cardX + cardPadding, cardY, filledW, barH, 1, 1, 'F');

      cardY += 6;
      const badgeText = dim.data.grade;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      const bW = pdf.getTextWidth(badgeText) + 6;
      const badgeFill = mixColor(gRgb, [16, 16, 22], 0.15);
      pdf.setFillColor(...badgeFill);
      pdf.roundedRect(cardX + cardPadding, cardY - 2.5, bW, 6, 3, 3, 'F');
      pdf.setDrawColor(gR, gG, gB);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(cardX + cardPadding, cardY - 2.5, bW, 6, 3, 3, 'S');
      pdf.setTextColor(gR, gG, gB);
      pdf.text(badgeText, cardX + cardPadding + 3, cardY + 1);

      cardY += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(180, 180, 190);
      rationaleLines.forEach((line: string, li: number) => {
        pdf.text(line, cardX + cardPadding, cardY + li * 4);
      });
      cardY += rationaleLines.length * 4 + 3;

      pdf.setFillColor(25, 25, 35);
      const evH = evidenceLines.length * 3.5 + 4;
      pdf.roundedRect(cardX + cardPadding, cardY - 2, colW - cardPadding * 2, evH, 2, 2, 'F');
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(7.5);
      pdf.setTextColor(140, 140, 150);
      evidenceLines.forEach((line: string, li: number) => {
        pdf.text(line, cardX + cardPadding + 3, cardY + 2 + li * 3.5);
      });
      cardY += evH + 4;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 110);
      pdf.text('TO IMPROVE', cardX + cardPadding, cardY);
      cardY += 4;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(160, 160, 170);
      improvementLines.forEach((line: string, li: number) => {
        pdf.text(line, cardX + cardPadding, cardY + li * 3.5);
      });
    });

    y = rowStartY + maxCardH + 8;
  }

  /* ═══════════════════════════════════════════
     INSIGHTS: Standout Strength + Critical Gap
     ═══════════════════════════════════════════ */
  ensureSpace(60);

  const strengthLines = wrapText(report.standout_strength, contentW - 14, 9);
  const strengthH = strengthLines.length * 4.5 + 16;

  const strengthBg = mixColor([22, 163, 74], BG, 0.08);
  pdf.setFillColor(...strengthBg);
  pdf.roundedRect(margin, y, contentW, strengthH, 3, 3, 'F');

  pdf.setFillColor(22, 163, 74);
  pdf.rect(margin, y, 2.5, strengthH, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(22, 163, 74);
  pdf.text('\u2726  STANDOUT STRENGTH', margin + 8, y + 8);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(200, 200, 210);
  strengthLines.forEach((line: string, i: number) => {
    pdf.text(line, margin + 8, y + 15 + i * 4.5);
  });

  y += strengthH + 6;
  ensureSpace(60);

  const gapLines = wrapText(report.critical_gap, contentW - 14, 9);
  const gapH = gapLines.length * 4.5 + 16;

  const gapBg = mixColor([217, 119, 6], BG, 0.08);
  pdf.setFillColor(...gapBg);
  pdf.roundedRect(margin, y, contentW, gapH, 3, 3, 'F');

  pdf.setFillColor(217, 119, 6);
  pdf.rect(margin, y, 2.5, gapH, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(217, 119, 6);
  pdf.text('\u26A0  CRITICAL GAP', margin + 8, y + 8);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(200, 200, 210);
  gapLines.forEach((line: string, i: number) => {
    pdf.text(line, margin + 8, y + 15 + i * 4.5);
  });

  y += gapH + 16;

  /* ═══════════════════════════════════════════
     FOOTER
     ═══════════════════════════════════════════ */
  ensureSpace(30);

  pdf.setDrawColor(40, 40, 50);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageW - margin, y);

  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(80, 80, 90);
  pdf.text('This report was generated by FinApply.ai \u00B7 FISS Score v1.0', pageW / 2, y, { align: 'center' });
  y += 5;
  pdf.setTextColor(60, 60, 70);
  pdf.text('Evaluated by human + AI collaboration \u00B7 Not a guarantee of employment outcomes', pageW / 2, y, { align: 'center' });

  /* ═══════════════════════════════════════════
     FOR EMPLOYERS — Executive Summary
     ═══════════════════════════════════════════ */
  y += 14;
  ensureSpace(55);

  const employerText = report.employer_summary
    || `This candidate completed FinApply's FISS Deal Room \u2014 a 45-minute timed case simulation that evaluates Financial Reasoning, Structured Thinking, Risk Identification, and Decision Clarity under realistic deal conditions. Their total FISS Score of ${report.total_score}/100 reflects live analytical performance, not self-reported skills or interview coaching.`;
  const employerLines = wrapText(employerText, contentW - 14, 9);
  const employerH = employerLines.length * 4.5 + 20;

  const employerBg = mixColor([37, 99, 235], BG, 0.06);
  pdf.setFillColor(...employerBg);
  pdf.roundedRect(margin, y, contentW, employerH, 3, 3, 'F');

  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y, contentW, employerH, 3, 3, 'S');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(37, 99, 235);
  pdf.text('FOR EMPLOYERS  \u00B7  EXECUTIVE SUMMARY', margin + 8, y + 8);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(200, 200, 210);
  employerLines.forEach((line: string, i: number) => {
    pdf.text(line, margin + 8, y + 16 + i * 4.5);
  });

  if (shareId) {
    y += employerH + 4;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(37, 99, 235);
    pdf.textWithLink(`Verify score: finapply.ai/score/${shareId}`, margin + 8, y, {
      url: `https://fin-apply-ai.vercel.app/score/${shareId}`,
    });
    pdf.setTextColor(100, 100, 110);
    pdf.text('  |  Contact: team@finapply.ai', margin + 8 + pdf.getTextWidth(`Verify score: finapply.ai/score/${shareId}`) + 2, y);
  } else {
    y += employerH;
  }

  y += 10;
  y += 5;
  pdf.setTextColor(50, 50, 60);
  pdf.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW / 2, y, { align: 'center' });

  /* ── Return Buffer ─────────────────────── */
  const arrayBuffer = pdf.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
