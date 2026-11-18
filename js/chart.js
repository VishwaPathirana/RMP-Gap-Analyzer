// RMP Gap Analyzer - Custom Canvas Charting Engine
// Zero-dependency, high-DPI crisp rendering tailored to plant gap analysis blueprint

class GapChartEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.data = null;
    this.metricMode = 'percent'; // 'percent' (default per blueprint) or 'count'
    this.chartType = 'bar'; // 'bar' or 'pareto'
    this.hoverIndex = -1;
    this.bars = [];
    this.animationProgress = 1;
    this.animationFrame = null;

    this.initEvents();
  }

  initEvents() {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    this.canvas.addEventListener('click', (e) => this.handleClick(e));

    window.addEventListener('resize', () => {
      this.resize();
      this.render();
    });
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set display size
    const displayWidth = rect.width || 800;
    const displayHeight = Math.max(380, Math.min(520, window.innerHeight * 0.45));
    
    this.canvas.style.width = displayWidth + 'px';
    this.canvas.style.height = displayHeight + 'px';

    // Set actual canvas buffer size
    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = displayWidth;
    this.height = displayHeight;
  }

  setData(analysisData, metricMode = 'percent', chartType = 'bar') {
    this.data = analysisData;
    this.metricMode = metricMode;
    this.chartType = chartType;
    this.resize();
    this.animate();
  }

  animate() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    let start = null;
    const duration = 400; // ms

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      this.animationProgress = 1 - Math.pow(1 - progress, 3);
      this.render();

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(step);
      }
    };
    this.animationFrame = requestAnimationFrame(step);
  }

  render() {
    if (!this.canvas || !this.data || !this.data.sections) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear background
    ctx.clearRect(0, 0, w, h);

    let sections = [...this.data.sections];
    if (sections.length === 0) {
      this.bars = [];
      ctx.save();
      ctx.fillStyle = '#64748b';
      ctx.font = '600 14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No sections selected. Pick one or more sections in the filter above.', w / 2, h / 2);
      ctx.restore();
      return;
    }

    if (this.chartType === 'pareto') {
      sections.sort((a, b) => {
        const valA = this.metricMode === 'percent' ? a.gapRatePercent : a.countOfGap;
        const valB = this.metricMode === 'percent' ? b.gapRatePercent : b.countOfGap;
        return valB - valA;
      });
    }

    // Chart margins
    const margin = {
      top: 48,
      right: this.chartType === 'pareto' ? 60 : 30,
      bottom: 75,
      left: 65
    };

    const chartWidth = w - margin.left - margin.right;
    const chartHeight = h - margin.top - margin.bottom;

    if (chartWidth <= 0 || chartHeight <= 0) return;

    // Determine max scale
    let maxVal = 0;
    sections.forEach(s => {
      const val = this.metricMode === 'percent' ? s.gapRatePercent : s.countOfGap;
      if (val > maxVal) maxVal = val;
    });

    if (this.metricMode === 'percent') {
      maxVal = Math.max(maxVal * 1.25, 20); // At least 20% scale ceiling
      maxVal = Math.ceil(maxVal / 5) * 5;  // Round up to multiple of 5
    } else {
      maxVal = Math.max(maxVal * 1.25, 6);
      maxVal = Math.ceil(maxVal / 2) * 2;
    }

    // Draw grid lines & Y-axis labels
    const gridLines = 5;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '500 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridLines; i++) {
      const ratio = i / gridLines;
      const y = margin.top + chartHeight * (1 - ratio);
      const val = Math.round(ratio * maxVal * 10) / 10;
      const label = this.metricMode === 'percent' ? `${val}%` : `${val}`;

      // Line
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(w - margin.right, y);
      ctx.stroke();

      // Label
      ctx.fillText(label, margin.left - 10, y);
    }

    // Y-Axis Title
    ctx.save();
    ctx.translate(18, margin.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#334155';
    ctx.font = '600 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(this.metricMode === 'percent' ? '% Gap Rate (False / Checkpoints)' : 'Count of Gaps (False Count)', 0, 0);
    ctx.restore();

    // Threshold / Benchmark reference line (5% standard threshold)
    if (this.metricMode === 'percent' && maxVal >= 5) {
      const targetY = margin.top + chartHeight * (1 - (5 / maxVal));
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(margin.left, targetY);
      ctx.lineTo(w - margin.right, targetY);
      ctx.stroke();

      // Badge
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Target Max: 5.0%', margin.left + 8, targetY - 6);
      ctx.restore();
    }

    // Draw Bars
    const totalBars = sections.length;
    const slotWidth = chartWidth / totalBars;
    const maxBarW = totalBars <= 5 ? 64 : 38;
    const barWidth = Math.max(12, Math.min(maxBarW, slotWidth * 0.62));
    this.bars = [];

    // Pareto cumulative tracker
    let cumulativeSum = 0;
    const totalGapsMetric = sections.reduce((acc, s) => {
      return acc + (this.metricMode === 'percent' ? s.gapRatePercent : s.countOfGap);
    }, 0);
    const paretoPoints = [];

    sections.forEach((s, idx) => {
      const val = this.metricMode === 'percent' ? s.gapRatePercent : s.countOfGap;
      const barHeight = (val / maxVal) * chartHeight * this.animationProgress;
      const xCenter = margin.left + idx * slotWidth + slotWidth / 2;
      const x = xCenter - barWidth / 2;
      const y = margin.top + chartHeight - barHeight;

      this.bars.push({
        x,
        y,
        width: barWidth,
        height: barHeight,
        xCenter,
        section: s,
        value: val,
        index: idx
      });

      // Bar Colors based on gap rate
      let fillColorStart = '#3b82f6';
      let fillColorEnd = '#1d4ed8';

      if (this.metricMode === 'percent') {
        if (s.gapRatePercent >= 15) {
          fillColorStart = '#f87171'; // Critical red
          fillColorEnd = '#dc2626';
        } else if (s.gapRatePercent >= 5) {
          fillColorStart = '#fbbf24'; // Warning amber
          fillColorEnd = '#d97706';
        } else {
          fillColorStart = '#34d399'; // Good emerald
          fillColorEnd = '#059669';
        }
      } else {
        if (s.countOfGap >= 3) {
          fillColorStart = '#f87171';
          fillColorEnd = '#dc2626';
        } else if (s.countOfGap >= 1) {
          fillColorStart = '#60a5fa';
          fillColorEnd = '#2563eb';
        } else {
          fillColorStart = '#94a3b8';
          fillColorEnd = '#64748b';
        }
      }

      // Highlight on hover
      const isHovered = this.hoverIndex === idx;
      if (isHovered) {
        ctx.save();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
        ctx.fillRect(xCenter - slotWidth / 2, margin.top, slotWidth, chartHeight);
        ctx.restore();
      }

      // Draw Bar with rounded top
      ctx.save();
      const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
      grad.addColorStop(0, fillColorStart);
      grad.addColorStop(1, fillColorEnd);
      ctx.fillStyle = isHovered ? '#1e40af' : grad;

      if (barHeight > 4) {
        const radius = Math.min(4, barWidth / 2);
        ctx.beginPath();
        ctx.moveTo(x, y + barHeight);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight);
        ctx.closePath();
        ctx.fill();
      } else if (barHeight > 0) {
        ctx.fillRect(x, y, barWidth, barHeight);
      }
      ctx.restore();

      // Top Value Label
      if (val > 0 && this.animationProgress > 0.6) {
        ctx.save();
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = isHovered ? '#0f172a' : '#475569';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const displayVal = this.metricMode === 'percent' ? `${val}%` : `${val}`;
        ctx.fillText(displayVal, xCenter, y - 4);
        ctx.restore();
      }

      // X-Axis Section Name Label
      ctx.save();
      ctx.translate(xCenter, margin.top + chartHeight + 12);
      ctx.rotate(-Math.PI / 4.2); // Angled 42 degrees for readability
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isHovered ? '#1e293b' : '#334155';
      ctx.font = isHovered 
        ? 'bold 11px system-ui, -apple-system, sans-serif'
        : '500 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(s.name, 0, 0);
      ctx.restore();

      // Track Pareto points if active
      if (this.chartType === 'pareto' && totalGapsMetric > 0) {
        cumulativeSum += val;
        const cumPercent = (cumulativeSum / totalGapsMetric) * 100;
        const paretoY = margin.top + chartHeight * (1 - (cumPercent / 100));
        paretoPoints.push({ x: xCenter, y: paretoY, cumPercent });
      }
    });

    // Draw Pareto Line if in Pareto mode
    if (this.chartType === 'pareto' && paretoPoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      paretoPoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Dots
      paretoPoints.forEach(pt => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Right Y-axis for Pareto %
      ctx.fillStyle = '#8b5cf6';
      ctx.font = '500 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      [0, 20, 40, 60, 80, 100].forEach(p => {
        const py = margin.top + chartHeight * (1 - p / 100);
        ctx.fillText(`${p}%`, w - margin.right + 8, py);
      });
      ctx.restore();
    }

    // X-Axis Baseline
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(w - margin.right, margin.top + chartHeight);
    ctx.stroke();

    // Chart bottom axis title (Sections)
    ctx.save();
    ctx.font = '600 12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    const xTitle = sections.length === 1
      ? `Section: ${sections[0].name} (${sections[0].code})`
      : `Sections (${sections.length} Plant Areas)`;
    ctx.fillText(xTitle, margin.left + chartWidth / 2, h - 8);
    ctx.restore();

    // Render tooltip if hovered
    if (this.hoverIndex !== -1 && this.bars[this.hoverIndex]) {
      this.renderTooltip(this.bars[this.hoverIndex]);
    }
  }

  renderTooltip(bar) {
    const ctx = this.ctx;
    const s = bar.section;

    const lines = [
      { text: `${s.name} (${s.code})`, bold: true, color: '#0f172a' },
      { text: `Category: ${s.category}`, color: '#64748b' },
      { text: `Count of Gaps: ${s.countOfGap} (False)`, color: '#b91c1c', bold: true },
      { text: `Gap Rate: ${s.gapRatePercent}% (Checks: ${s.totalChecks})`, color: '#1e293b' },
      { text: `Share of Plant Gaps: ${s.gapSharePercent}%`, color: '#475569' },
      { text: `Status: ${s.openGaps} Open, ${s.resolvedGaps} Resolved`, color: '#0284c7' }
    ];

    ctx.save();
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    let maxTextWidth = 0;
    lines.forEach(l => {
      const tw = ctx.measureText(l.text).width;
      if (tw > maxTextWidth) maxTextWidth = tw;
    });

    const boxWidth = maxTextWidth + 24;
    const boxHeight = lines.length * 17 + 16;
    let boxX = bar.xCenter - boxWidth / 2;
    let boxY = bar.y - boxHeight - 12;

    // Bounds checking
    if (boxX < 10) boxX = 10;
    if (boxX + boxWidth > this.width - 10) boxX = this.width - boxWidth - 10;
    if (boxY < 10) boxY = bar.y + bar.height + 14;

    // Tooltip Card background with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;

    // Rounded rectangle
    const r = 6;
    ctx.beginPath();
    ctx.moveTo(boxX + r, boxY);
    ctx.lineTo(boxX + boxWidth - r, boxY);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + r);
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight - r);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - r, boxY + boxHeight);
    ctx.lineTo(boxX + r, boxY + boxHeight);
    ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - r);
    ctx.lineTo(boxX, boxY + r);
    ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Tooltip text
    lines.forEach((l, i) => {
      ctx.font = l.bold ? 'bold 11px system-ui, -apple-system, sans-serif' : '11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = l.color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(l.text, boxX + 12, boxY + 10 + i * 17);
    });

    ctx.restore();
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let foundIdx = -1;
    for (let i = 0; i < this.bars.length; i++) {
      const b = this.bars[i];
      // Expand hit test vertically
      if (mouseX >= b.x - 4 && mouseX <= b.x + b.width + 4 && mouseY >= 30 && mouseY <= this.height - 50) {
        foundIdx = i;
        break;
      }
    }

    if (foundIdx !== this.hoverIndex) {
      this.hoverIndex = foundIdx;
      this.canvas.style.cursor = foundIdx !== -1 ? 'pointer' : 'default';
      this.render();
    }
  }

  handleMouseLeave() {
    if (this.hoverIndex !== -1) {
      this.hoverIndex = -1;
      this.canvas.style.cursor = 'default';
      this.render();
    }
  }

  handleClick(e) {
    if (this.hoverIndex !== -1 && this.bars[this.hoverIndex]) {
      const sec = this.bars[this.hoverIndex].section;
      if (typeof window.onSelectSectionFromChart === 'function') {
        window.onSelectSectionFromChart(sec);
      }
    }
  }

  exportImage() {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = `rmp-gap-analysis-chart-${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }
}

window.GapChartEngine = GapChartEngine;
