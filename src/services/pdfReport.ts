/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { ResearchReport } from '../types/index.ts';
import { formatINR, formatPercent, getISTTimestamp } from '../utils/format.ts';

export function exportResearchReportToPDF(report: ResearchReport): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = 45;

  const checkPageBreak = (neededHeight: number = 40) => {
    if (y + neededHeight > pageHeight - margin - 20) {
      doc.addPage();
      y = margin;
      drawFooter();
    }
  };

  const drawFooter = () => {
    const pageNum = (doc as any).internal.getNumberOfPages();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      `ARTHA AI · Indian Financial Research Intelligence · Page ${pageNum} · Confidential & Educational Only`,
      margin,
      pageHeight - 20
    );
  };

  // Header Background bar
  doc.setFillColor(11, 31, 58); // #0B1F3A Navy
  doc.rect(0, 0, pageWidth, 75, 'F');

  // Tricolor accent line
  doc.setFillColor(255, 153, 51); // Saffron
  doc.rect(0, 72, pageWidth / 3, 3, 'F');
  doc.setFillColor(255, 255, 255); // White
  doc.rect(pageWidth / 3, 72, pageWidth / 3, 3, 'F');
  doc.setFillColor(19, 136, 8); // Green
  doc.rect((2 * pageWidth) / 3, 72, pageWidth / 3, 3, 'F');

  // Title & Wordmark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('ARTHA', margin, 42);

  doc.setTextColor(255, 153, 51); // Saffron
  doc.text('AI', margin + 85, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text('INDIAN FINANCIAL RESEARCH & INTELLIGENCE PLATFORM (NSE/BSE)', margin, 58);

  // Right-aligned report label
  doc.setFontSize(8);
  doc.setTextColor(255, 153, 51);
  doc.text('RESEARCH DOSSIER · TRACK B', pageWidth - margin - 150, 42);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${getISTTimestamp()}`, pageWidth - margin - 150, 56);

  y = 95;

  // Metadata block
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 75, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`${report.companyName} (${report.symbol})`, margin + 14, y + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Sector: ${report.sector} · Exchange: ${report.exchange}`, margin + 14, y + 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Price: ${formatINR(report.quote.price)}`, margin + 14, y + 56);

  doc.setFontSize(10);
  const chgColor = report.quote.changePercent >= 0 ? [22, 163, 74] : [229, 72, 77];
  doc.setTextColor(chgColor[0], chgColor[1], chgColor[2]);
  doc.text(`(${formatPercent(report.quote.changePercent)})`, margin + 140, y + 56);

  // Score badge inside metadata block
  doc.setFillColor(11, 31, 58);
  doc.roundedRect(pageWidth - margin - 120, y + 10, 105, 55, 4, 4, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 153, 51);
  doc.text('COMPOSITE SCORE', pageWidth - margin - 110, y + 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(`${report.scores.overall}/100`, pageWidth - margin - 110, y + 50);

  y += 90;

  // Analytical Score Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('ANALYTICAL SUB-SCORES BREAKDOWN (0 - 100)', margin, y);
  y += 12;

  const scoreRows = [
    { label: 'Technical Structure (25% wt)', score: `${report.scores.technical}/100`, sub: `Trend: ${report.technical.trend}` },
    { label: 'Fundamental Quality (25% wt)', score: `${report.scores.fundamental}/100`, sub: `P/E: ${report.fundamental.peRatio}x, ROE: ${report.fundamental.roe}%` },
    { label: 'FinBERT Sentiment (15% wt)', score: `${report.scores.sentiment}/100`, sub: `Bias: ${report.sentiment.label}` },
    { label: 'Risk Resilience (20% wt)', score: `${report.scores.riskResilience}/100`, sub: `Beta: ${report.risk.betaVsNifty}, Vol: ${report.risk.annualizedVolatility}%` },
    { label: 'Macro Transmission (15% wt)', score: `${report.scores.macro}/100`, sub: `Sector: ${report.sector}` },
  ];

  const colW = contentWidth / 5;
  scoreRows.forEach((sc, idx) => {
    const xPos = margin + idx * colW;
    doc.setFillColor(241, 245, 249);
    doc.rect(xPos, y, colW - 4, 42, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(sc.label.split(' ')[0], xPos + 6, y + 14);
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(sc.score, xPos + 6, y + 28);
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(sc.sub, xPos + 6, y + 37);
  });

  y += 55;

  // Helper to print a section
  const printSection = (num: number, title: string, content: string | string[]) => {
    checkPageBreak(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 31, 58); // #0B1F3A Navy
    doc.text(`${num}. ${title.toUpperCase()}`, margin, y);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    if (Array.isArray(content)) {
      content.forEach(item => {
        checkPageBreak(25);
        const splitBullet = doc.splitTextToSize(`•  ${item}`, contentWidth - 10);
        doc.text(splitBullet, margin + 8, y);
        y += splitBullet.length * 12 + 4;
      });
      y += 6;
    } else {
      const splitText = doc.splitTextToSize(content, contentWidth);
      doc.text(splitText, margin, y);
      y += splitText.length * 12 + 12;
    }
  };

  // 13 Sections Output
  printSection(1, 'Executive Summary', report.sections.executiveSummary);
  printSection(2, 'Market Overview', report.sections.marketOverview);
  printSection(3, 'Technical Analysis', report.sections.technicalAnalysis);
  printSection(4, 'Fundamental Analysis', report.sections.fundamentalAnalysis);
  printSection(5, 'News & Sentiment', report.sections.newsAndSentiment);
  printSection(6, 'Macro Environment', report.sections.macroEnvironment);
  printSection(7, 'Risk Assessment', report.sections.riskAssessment);
  printSection(8, 'Portfolio Impact', report.sections.portfolioImpact);
  printSection(9, 'Bull Case', report.sections.bullCase);
  printSection(10, 'Bear Case', report.sections.bearCase);
  printSection(11, 'Key Risks', report.sections.keyRisks);

  // 12. Data Sources Table
  checkPageBreak(80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 31, 58);
  doc.text('12. DATA SOURCES & AUDIT TRAIL', margin, y);
  y += 14;

  report.sections.dataSources.forEach(src => {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`[${src.status}] ${src.name}`, margin + 8, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`(${src.timestamp})`, margin + 260, y);
    y += 14;
  });
  y += 8;

  // 13. AI Conclusion
  printSection(13, 'AI Research Conclusion', report.sections.conclusion);

  // Regulatory Disclaimer Box
  checkPageBreak(70);
  doc.setFillColor(254, 242, 242); // Light red/pink
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(margin, y, contentWidth, 55, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(185, 28, 28);
  doc.text('MANDATORY REGULATORY DISCLAIMER (SEBI COMPLIANCE)', margin + 10, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(127, 29, 29);
  const disclaimerLines = doc.splitTextToSize(report.sections.disclaimer, contentWidth - 20);
  doc.text(disclaimerLines, margin + 10, y + 28);

  drawFooter();

  // Save to trigger browser download
  const dateStr = new Date().toISOString().split('T')[0];
  const safeSymbol = report.symbol.replace(/[^A-Za-z0-9]/g, '_');
  doc.save(`ARTHA_AI_Research_Report_${safeSymbol}_${dateStr}.pdf`);
}
