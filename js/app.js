// RMP Gap Analyzer - Main Application Controller
// Orchestrates views, state, chart updates, and audit workflows

class GapApp {
  constructor() {
    this.currentView = 'table'; // 'table' (Page 1), 'chart' (Page 2), 'registry' (Page 3), 'section-detail' (Full Page)
    this.previousView = 'table';
    this.currentPeriod = '2week'; // blueprint default: '2week', 'month', 'year', 'all'
    this.chartMetric = 'percent'; // 'percent' (blueprint % axis) or 'count'
    this.chartType = 'bar'; // 'bar' or 'pareto'
    this.activeSectionId = null;
    this.chartEngine = null;
    this.pendingImages = [];
    this.pendingAttachGapId = null;
    this.lightboxState = { gapId: null, index: 0 };
    this.selectedChartSectionIds = new Set();

    this.init();
  }

  init() {
    this.selectedChartSectionIds = new Set(window.gapDataStore.getSections().map(s => s.id));
    this.initChart();
    this.bindEvents();
    this.populateSectionDropdowns();
    this.render();
  }

  initChart() {
    this.chartEngine = new GapChartEngine('gapBarChart');
  }

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const view = tab.getAttribute('data-view');
        this.switchView(view);
      });
    });

    // Time Period Buttons (As per 2 week, month, year)
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentPeriod = btn.getAttribute('data-period');
        this.render();
        this.showToast(`Switched time period: ${btn.innerText.trim()}`);
      });
    });

    // Chart Metric Toggles (% vs Count)
    document.querySelectorAll('.chart-metric-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.chart-metric-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.chartMetric = btn.getAttribute('data-metric');
        this.renderChart();
      });
    });

    // Chart Type (Standard Bar vs Pareto)
    const paretoToggle = document.getElementById('togglePareto');
    if (paretoToggle) {
      paretoToggle.addEventListener('click', () => {
        this.chartType = this.chartType === 'bar' ? 'pareto' : 'bar';
        paretoToggle.classList.toggle('active', this.chartType === 'pareto');
        paretoToggle.innerText = this.chartType === 'pareto' ? '📊 Standard View' : '📈 Pareto 80/20 View';
        this.renderChart();
      });
    }

    // Chart Export Button
    const exportChartBtn = document.getElementById('exportChartBtn');
    if (exportChartBtn) {
      exportChartBtn.addEventListener('click', () => {
        if (this.chartEngine) this.chartEngine.exportImage();
      });
    }

    // New Gap Modal Controls
    const openAddGapBtn = document.getElementById('openAddGapBtn');
    if (openAddGapBtn) {
      openAddGapBtn.addEventListener('click', () => this.openAddGapModal());
    }

    const gapForm = document.getElementById('newGapForm');
    if (gapForm) {
      gapForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveNewGap();
      });
    }

    // Excel Sheet Export (.xlsx)
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', () => this.downloadExcel());
    }

    // Clear All Data
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => {
        if (confirm('Clear ALL recorded false/gap data across all 14 sections? This cannot be undone.')) {
          window.gapDataStore.clearAllData();
          this.render();
          this.showToast('All gap data cleared! Ready for fresh records.');
        }
      });
    }

    // Image Upload in Log New Gap Modal
    const gapImageInput = document.getElementById('gapImageInput');
    if (gapImageInput) {
      gapImageInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleImageFilesSelected(e.target.files, 'modal');
          e.target.value = '';
        }
      });
    }

    const dropZone = document.getElementById('gapImageDropZone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleImageFilesSelected(e.dataTransfer.files, 'modal');
        }
      });
    }

    // Attach Photos to Existing False Finding
    const existingPhotoInput = document.getElementById('existingGapPhotoInput');
    if (existingPhotoInput) {
      existingPhotoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0 && this.pendingAttachGapId) {
          this.handleImageFilesSelected(e.target.files, 'existing', this.pendingAttachGapId);
          e.target.value = '';
        }
      });
    }

    // Lightbox Keyboard Controls
    document.addEventListener('keydown', (e) => {
      const lb = document.getElementById('imageLightboxModal');
      if (!lb || !lb.classList.contains('active')) return;
      if (e.key === 'Escape') this.closeLightbox();
      else if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
      else if (e.key === 'ArrowRight') this.navigateLightbox(1);
    });

    // Hook for clicking bar in chart
    window.onSelectSectionFromChart = (sec) => {
      this.openSectionDetailsModal(sec.id);
    };
  }

  switchView(viewName) {
    if (viewName === 'section-detail' && this.currentView !== 'section-detail') {
      this.previousView = this.currentView;
    }
    this.currentView = viewName;
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-view') === viewName);
    });
    document.querySelectorAll('.view-panel').forEach(p => {
      p.classList.toggle('active', p.id === `view-${viewName}`);
    });

    // Hide global KPI cards when viewing dedicated full-page section details
    const globalKpi = document.getElementById('globalKpiGrid');
    if (globalKpi) {
      globalKpi.style.display = viewName === 'section-detail' ? 'none' : '';
    }

    if (viewName === 'chart') {
      setTimeout(() => {
        if (this.chartEngine) {
          this.chartEngine.resize();
          this.renderChart();
        }
      }, 50);
    } else if (viewName === 'registry') {
      this.renderRegistry();
    } else if (viewName === 'section-detail') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  populateSectionDropdowns() {
    const sections = window.gapDataStore.getSections();
    const dropdowns = ['gapSectionSelect', 'registryFilterSection', 'secPageSwitcher'];

    dropdowns.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const currentVal = el.value;
      let html = id === 'registryFilterSection' ? '<option value="all">All Sections (14)</option>' : '';
      
      sections.forEach(s => {
        html += `<option value="${s.id}">${s.code} - ${s.name} (${s.category})</option>`;
      });
      el.innerHTML = html;
      if (currentVal) el.value = currentVal;
    });

    // Populate Chart Section Filter Dropdown (All, With Gaps, Categories, Single Section)
    const chartDropdown = document.getElementById('chartSectionDropdown');
    if (chartDropdown) {
      const categories = [...new Set(sections.map(s => s.category))];
      let html = `<option value="all">All Sections (${sections.length})</option>`;
      html += `<option value="with-gaps">Only Sections with Gaps (&gt; 0)</option>`;
      html += `<option value="custom" disabled>Custom Selection</option>`;
      html += `<optgroup label="Filter by Category">`;
      categories.forEach(cat => {
        html += `<option value="cat:${cat}">${cat}</option>`;
      });
      html += `</optgroup>`;
      html += `<optgroup label="Filter by Single Section">`;
      sections.forEach(s => {
        html += `<option value="sec:${s.id}">${s.code} - ${s.name}</option>`;
      });
      html += `</optgroup>`;
      chartDropdown.innerHTML = html;
      chartDropdown.value = 'all';
    }
  }

  render() {
    const analysis = window.gapDataStore.getSectionAnalysis(this.currentPeriod);

    this.updatePeriodDisplay();
    this.renderKPIs(analysis);
    this.renderTable(analysis);
    this.renderChart(analysis);
    this.renderLeaderboard(analysis);
    if (this.currentView === 'section-detail' && this.activeSectionId) {
      this.renderSectionDetailsPage(analysis);
    }
    if (this.currentView === 'registry') {
      this.renderRegistry();
    }
  }

  updatePeriodDisplay() {
    const labels = {
      '2week': 'Showing Last 14 Days (Bi-weekly evaluation as per blueprint)',
      'month': 'Showing Last 30 Days (Monthly evaluation as per blueprint)',
      'year': 'Showing Current Year 2026 (Annual evaluation as per blueprint)',
      'all': 'Showing All Recorded Inspection Data'
    };
    const el = document.getElementById('periodDateDisplay');
    if (el) {
      el.innerHTML = `<span>📅</span> ${labels[this.currentPeriod] || ''}`;
    }

    const chartTitlePeriod = document.getElementById('chartTitlePeriod');
    if (chartTitlePeriod) {
      const periodShort = {
        '2week': 'As per 2 week',
        'month': 'As per month',
        'year': 'As per year',
        'all': 'All Time'
      };
      chartTitlePeriod.innerText = `(${periodShort[this.currentPeriod]})`;
    }
  }

  renderKPIs(analysis) {
    document.getElementById('kpiTotalGaps').innerText = analysis.totalGaps;
    document.getElementById('kpiOverallRate').innerText = `${analysis.overallGapRate}%`;
    
    const worstSec = analysis.highestGapSection;
    document.getElementById('kpiTopSection').innerText = worstSec ? `${worstSec.name} (${worstSec.countOfGap})` : 'None';
    
    const openGapsCount = analysis.sections.reduce((acc, s) => acc + s.openGaps, 0);
    document.getElementById('kpiOpenGaps').innerText = openGapsCount;
  }

  // Render Table (Page 1): Section | Count of Gap | %
  renderTable(analysis) {
    const tbody = document.getElementById('sectionTableBody');
    if (!tbody) return;

    let html = '';
    analysis.sections.forEach((s) => {
      const statusBadgeClass = s.statusLevel === 'critical' ? 'high' : (s.statusLevel === 'warning' ? 'medium' : 'low');
      const countBadgeClass = s.countOfGap === 0 ? 'zero' : statusBadgeClass;

      html += `
        <tr>
          <td style="font-weight: 700; color: #64748b;">${s.number}</td>
          <td>
            <div class="sec-name-cell">
              <span class="sec-code-badge">${s.code}</span>
              <div>
                <div class="sec-title">${s.name}</div>
                <div class="sec-cat">${s.category}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="gap-count-badge ${countBadgeClass}">
              ${s.countOfGap}
            </span>
          </td>
          <td>
            <div class="rate-progress-wrapper">
              <span class="rate-val">${s.gapRatePercent}%</span>
              <div class="rate-bar-bg">
                <div class="rate-bar-fill ${s.statusLevel}" style="width: ${Math.min(s.gapRatePercent * 3.5, 100)}%;"></div>
              </div>
            </div>
          </td>
          <td>
            <span style="font-size: 0.825rem; font-weight: 600; color: #475569;">
              ${s.gapSharePercent}%
            </span>
          </td>
          <td>
            <div class="severity-pills">
              ${s.criticalGaps > 0 ? `<span class="sev-pill crit" title="Critical">${s.criticalGaps}C</span>` : ''}
              ${s.majorGaps > 0 ? `<span class="sev-pill maj" title="Major">${s.majorGaps}M</span>` : ''}
              ${s.minorGaps > 0 ? `<span class="sev-pill min" title="Minor">${s.minorGaps}m</span>` : ''}
              ${s.countOfGap === 0 ? '<span style="color:#94a3b8; font-size:0.75rem;">None</span>' : ''}
            </div>
          </td>
          <td>
            <span style="font-size: 0.8rem; font-weight: 600; color: ${s.openGaps > 0 ? '#dc2626' : '#16a34a'};">
              ${s.openGaps > 0 ? `${s.openGaps} Open` : 'Clear'}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-secondary btn-sm" onclick="app.openSectionDetailsModal('${s.id}')" title="View Gaps & Details">
                🔍 Details
              </button>
              <button class="btn btn-primary btn-sm" onclick="app.quickAddForSection('${s.id}')" title="Log False / Gap">
                + Add False
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  getFilteredChartAnalysis(analysis) {
    const filteredSections = analysis.sections.filter(s => this.selectedChartSectionIds.has(s.id));
    return {
      ...analysis,
      sections: filteredSections
    };
  }

  renderChartSectionChips(analysis) {
    const chipsContainer = document.getElementById('chartSectionChips');
    const countBadge = document.getElementById('chartFilterCountBadge');
    const totalCount = analysis.sections.length;
    const selectedCount = analysis.sections.filter(s => this.selectedChartSectionIds.has(s.id)).length;

    if (countBadge) {
      countBadge.innerText = `Showing ${selectedCount} / ${totalCount} Sections`;
    }

    if (!chipsContainer) return;
    chipsContainer.innerHTML = analysis.sections.map(s => {
      const isActive = this.selectedChartSectionIds.has(s.id);
      return `
        <button type="button" class="section-chip ${isActive ? 'active' : ''}" onclick="app.toggleChartSectionChip('${s.id}')" title="Toggle ${s.name} in bar chart">
          <span>${s.name}</span>
          <span class="chip-count">${s.countOfGap}</span>
        </button>
      `;
    }).join('');
  }

  onChartDropdownFilter(value) {
    const analysis = window.gapDataStore.getSectionAnalysis(this.currentPeriod);
    if (value === 'all') {
      this.selectedChartSectionIds = new Set(analysis.sections.map(s => s.id));
    } else if (value === 'with-gaps') {
      this.selectedChartSectionIds = new Set(analysis.sections.filter(s => s.countOfGap > 0).map(s => s.id));
    } else if (value.startsWith('cat:')) {
      const cat = value.slice(4);
      this.selectedChartSectionIds = new Set(analysis.sections.filter(s => s.category === cat).map(s => s.id));
    } else if (value.startsWith('sec:')) {
      const secId = value.slice(4);
      this.selectedChartSectionIds = new Set([secId]);
    }
    this.renderChart(analysis);
    this.renderLeaderboard(analysis);
  }

  toggleChartSectionChip(sectionId) {
    if (this.selectedChartSectionIds.has(sectionId)) {
      this.selectedChartSectionIds.delete(sectionId);
    } else {
      this.selectedChartSectionIds.add(sectionId);
    }

    const analysis = window.gapDataStore.getSectionAnalysis(this.currentPeriod);
    const dropdown = document.getElementById('chartSectionDropdown');
    if (dropdown) {
      if (this.selectedChartSectionIds.size === analysis.sections.length) {
        dropdown.value = 'all';
      } else if (this.selectedChartSectionIds.size === 1) {
        const onlyId = Array.from(this.selectedChartSectionIds)[0];
        dropdown.value = `sec:${onlyId}`;
      } else {
        dropdown.value = 'custom';
      }
    }

    this.renderChart(analysis);
    this.renderLeaderboard(analysis);
  }

  selectAllChartSections() {
    const dropdown = document.getElementById('chartSectionDropdown');
    if (dropdown) dropdown.value = 'all';
    this.onChartDropdownFilter('all');
  }

  selectGapOnlyChartSections() {
    const dropdown = document.getElementById('chartSectionDropdown');
    if (dropdown) dropdown.value = 'with-gaps';
    this.onChartDropdownFilter('with-gaps');
  }

  // Render Bar Chart (Page 2)
  renderChart(analysis = null) {
    if (!analysis) analysis = window.gapDataStore.getSectionAnalysis(this.currentPeriod);
    this.renderChartSectionChips(analysis);
    const filtered = this.getFilteredChartAnalysis(analysis);
    if (this.chartEngine) {
      this.chartEngine.setData(filtered, this.chartMetric, this.chartType);
    }
  }

  renderLeaderboard(analysis) {
    const list = document.getElementById('leaderboardList');
    if (!list) return;

    const filtered = this.getFilteredChartAnalysis(analysis);
    if (filtered.sections.length === 0) {
      list.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: #94a3b8; font-size: 0.85rem;">No sections selected in filter.</div>`;
      return;
    }

    const sorted = [...filtered.sections].sort((a, b) => b.countOfGap - a.countOfGap || b.gapRatePercent - a.gapRatePercent);
    let html = '';

    sorted.slice(0, 5).forEach((s, idx) => {
      const rankClass = idx === 0 ? 'top1' : (idx === 1 ? 'top2' : (idx === 2 ? 'top3' : ''));
      html += `
        <div class="section-rank-item" onclick="app.openSectionDetailsModal('${s.id}')" style="cursor: pointer;">
          <div class="rank-left">
            <span class="rank-num ${rankClass}">#${idx + 1}</span>
            <div>
              <div style="font-weight: 700; font-size: 0.875rem;">${s.name}</div>
              <div style="font-size: 0.725rem; color: #64748b;">${s.category}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; color: ${s.countOfGap > 0 ? '#b91c1c' : '#16a34a'}; font-size: 0.9rem;">
              ${s.countOfGap} Gaps
            </div>
            <div style="font-size: 0.725rem; color: #64748b;">
              ${s.gapRatePercent}% rate
            </div>
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
  }

  // Quick Add Gap
  quickAddForSection(sectionId) {
    this.openAddGapModal(sectionId);
  }

  openAddGapModal(defaultSectionId = null) {
    const modal = document.getElementById('newGapModal');
    if (!modal) return;
    
    if (defaultSectionId) {
      document.getElementById('gapSectionSelect').value = defaultSectionId;
    }
    document.getElementById('gapDate').value = typeof formatLocalDate === 'function'
      ? formatLocalDate(new Date())
      : new Date().toISOString().split('T')[0];
    document.getElementById('gapTitle').value = '';
    document.getElementById('gapDesc').value = '';
    document.getElementById('gapAction').value = '';
    this.pendingImages = [];
    this.renderPendingImagePreviews();

    modal.classList.add('active');
  }

  closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('active');
  }

  // Compress and encode uploaded image file to stay lightweight in localStorage
  compressImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.onload = (ev) => {
        const rawDataUrl = ev.target.result;
        const img = new Image();
        img.onerror = () => {
          // Fallback to raw DataURL if browser cannot decode via Image/Canvas
          resolve({
            id: 'img-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            name: file.name || 'evidence.jpg',
            dataUrl: rawDataUrl
          });
        };
        img.onload = () => {
          const maxDim = 1024;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          try {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.78);
            resolve({
              id: 'img-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
              name: file.name || 'evidence.jpg',
              dataUrl: compressed
            });
          } catch (err) {
            resolve({
              id: 'img-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
              name: file.name || 'evidence.jpg',
              dataUrl: rawDataUrl
            });
          }
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  async handleImageFilesSelected(fileList, targetMode = 'modal', gapId = null) {
    const imageFiles = Array.from(fileList).filter(f => f.type && f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      this.showToast('Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    const processed = [];
    for (const file of imageFiles) {
      try {
        const item = await this.compressImageFile(file);
        processed.push(item);
      } catch (e) {
        console.error('Image processing error:', e);
      }
    }

    if (targetMode === 'modal') {
      this.pendingImages.push(...processed);
      this.renderPendingImagePreviews();
      this.showToast(`Added ${processed.length} photo(s) to finding.`);
    } else if (targetMode === 'existing' && gapId) {
      window.gapDataStore.addImagesToGap(gapId, processed);
      this.pendingAttachGapId = null;
      this.render();
      this.showToast(`Attached ${processed.length} evidence photo(s)!`);
    }
  }

  renderPendingImagePreviews() {
    const list = document.getElementById('gapImagePreviewList');
    if (!list) return;
    if (this.pendingImages.length === 0) {
      list.innerHTML = '';
      return;
    }
    list.innerHTML = this.pendingImages.map((img, idx) => `
      <div class="upload-thumb-item" title="${img.name}">
        <img src="${img.dataUrl}" alt="${img.name}">
        <button type="button" class="upload-thumb-remove" onclick="app.removePendingImage(${idx})" title="Remove photo">&times;</button>
      </div>
    `).join('');
  }

  removePendingImage(index) {
    this.pendingImages.splice(index, 1);
    this.renderPendingImagePreviews();
  }

  triggerAttachPhoto(gapId) {
    this.pendingAttachGapId = gapId;
    const input = document.getElementById('existingGapPhotoInput');
    if (input) input.click();
  }

  handleSaveNewGap() {
    const sectionId = document.getElementById('gapSectionSelect').value;
    const title = document.getElementById('gapTitle').value.trim();
    const date = document.getElementById('gapDate').value;
    const category = document.getElementById('gapCategory').value;
    const severity = document.getElementById('gapSeverity').value;
    const auditor = document.getElementById('gapAuditor').value.trim() || 'Lead Inspector';
    const description = document.getElementById('gapDesc').value.trim();
    const correctiveAction = document.getElementById('gapAction').value.trim();

    if (!title) {
      alert('Please enter a gap title / issue description.');
      return;
    }

    const uploadedCount = this.pendingImages.length;

    window.gapDataStore.addGap({
      sectionId,
      title,
      date,
      category,
      severity,
      auditor,
      description,
      correctiveAction,
      images: [...this.pendingImages],
      status: 'Open'
    });

    this.pendingImages = [];
    this.renderPendingImagePreviews();
    this.closeModal('newGapModal');
    this.render();
    this.showToast(`Logged new False/Gap: "${title}"${uploadedCount > 0 ? ` (${uploadedCount} photo${uploadedCount > 1 ? 's' : ''})` : ''}`);
  }

  // Full-Page Section Details View
  openSectionDetailsModal(sectionId) {
    const sec = window.gapDataStore.getSectionById(sectionId);
    if (!sec) return;

    this.activeSectionId = sectionId;

    const statusFilter = document.getElementById('secPageStatusFilter');
    if (statusFilter) statusFilter.value = 'all';

    this.switchView('section-detail');
    this.renderSectionDetailsPage();
  }

  goBackFromSectionDetail() {
    this.switchView(this.previousView || 'table');
  }

  renderSectionDetailsPage(analysis = null) {
    if (!this.activeSectionId) return;
    const sec = window.gapDataStore.getSectionById(this.activeSectionId);
    if (!sec) return;

    if (!analysis) {
      analysis = window.gapDataStore.getSectionAnalysis(this.currentPeriod);
    }
    const secData = analysis.sections.find(s => s.id === this.activeSectionId);

    document.getElementById('secPageTitle').innerText = `${sec.code} - ${sec.name}`;
    document.getElementById('secPageCat').innerText = `${sec.category} • ${sec.desc}`;
    document.getElementById('secPageCount').innerText = secData ? secData.countOfGap : 0;
    document.getElementById('secPageRate').innerText = secData ? `${secData.gapRatePercent}%` : '0%';
    document.getElementById('secPageChecksSub').innerText = secData ? `${secData.totalChecks} evaluated checkpoints` : 'Evaluated checkpoints';
    document.getElementById('secPageOpen').innerText = secData ? secData.openGaps : 0;
    document.getElementById('secPageResolved').innerText = secData ? secData.resolvedGaps : 0;

    const switcher = document.getElementById('secPageSwitcher');
    if (switcher) switcher.value = this.activeSectionId;

    const addBtn = document.getElementById('secPageAddGapBtn');
    if (addBtn) {
      addBtn.onclick = () => this.openAddGapModal(this.activeSectionId);
    }

    const statusFilterEl = document.getElementById('secPageStatusFilter');
    const statusFilter = statusFilterEl ? statusFilterEl.value : 'all';

    let gaps = secData ? [...secData.gaps] : [];
    if (statusFilter !== 'all') {
      gaps = gaps.filter(g => g.status === statusFilter);
    }

    const listEl = document.getElementById('secPageGapsList');
    if (gaps.length > 0) {
      let html = '<div class="gap-detail-grid">';
      gaps.forEach(g => {
        const sevClass = g.severity === 'Critical' ? 'crit' : (g.severity === 'Major' ? 'maj' : 'min');
        const statusColor = g.status === 'Resolved' ? '#059669' : (g.status === 'In Progress' ? '#d97706' : '#dc2626');
        const images = Array.isArray(g.images) ? g.images : [];
        const evidenceHtml = images.length > 0 ? `
          <div class="gap-evidence-section">
            <div class="gap-evidence-label">
              <span>📷</span> Evidence Photos (${images.length}) — Click to Preview
            </div>
            <div class="gap-evidence-strip">
              ${images.map((img, idx) => `
                <div class="gap-evidence-thumb" onclick="app.openLightbox('${g.id}', ${idx})" title="Click to preview ${img.name || 'photo'}">
                  <img src="${img.dataUrl}" alt="${img.name || 'Evidence photo'}">
                  <span class="gap-evidence-zoom">🔍</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : '';

        html += `
          <div class="gap-detail-card">
            <div>
              <div class="gap-detail-card-head">
                <div class="gap-detail-card-title">${g.title}</div>
                <span class="sev-pill ${sevClass}">${g.severity}</span>
              </div>
              <div class="gap-detail-card-meta" style="margin-top: 0.35rem; margin-bottom: 0.65rem;">
                Logged on <strong>${g.date}</strong> by ${g.auditor} • Category: ${g.category} • Status: <strong style="color: ${statusColor};">${g.status}</strong>
              </div>
              <p class="gap-detail-card-desc">${g.description || 'No additional description provided.'}</p>
              ${g.correctiveAction ? `<div class="gap-detail-action-box" style="margin-top: 0.75rem;"><strong>Action:</strong> ${g.correctiveAction}</div>` : ''}
              ${evidenceHtml}
            </div>
            <div class="gap-detail-card-footer">
              <span style="font-size: 0.75rem; color: #94a3b8; font-family: ui-monospace, monospace;">${g.id}</span>
              <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" onclick="app.triggerAttachPhoto('${g.id}')" title="Upload evidence photos for this false finding">📷 + Photo</button>
                ${g.status !== 'Resolved' ? `
                  <button class="btn btn-secondary btn-sm" onclick="app.markGapResolved('${g.id}')">✓ Mark Resolved</button>
                ` : `
                  <span style="font-size: 0.8rem; color: #059669; font-weight: 700;">✓ Resolved</span>
                `}
                <button class="btn btn-secondary btn-sm" style="color: #dc2626;" onclick="app.deleteGapRecord('${g.id}')">Delete</button>
              </div>
            </div>
          </div>
        `;
      });
      html += '</div>';
      listEl.innerHTML = html;
    } else {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 3.5rem 1.5rem; color: #94a3b8;">
          <div style="font-size: 2.5rem; margin-bottom: 0.65rem;">🎉</div>
          <div style="font-weight: 700; font-size: 1.05rem; color: #334155;">No Gaps Recorded for ${sec.name} ${statusFilter !== 'all' ? `(${statusFilter})` : 'in this period'}</div>
          <p style="font-size: 0.85rem; margin-top: 0.35rem;">Section meets 100% compliance standards for the selected filter.</p>
        </div>
      `;
    }
  }

  markGapResolved(gapId) {
    window.gapDataStore.updateGap(gapId, { status: 'Resolved' });
    this.render();
    this.showToast('Gap marked as Resolved!');
  }

  deleteGapRecord(gapId) {
    if (confirm('Delete this gap entry?')) {
      window.gapDataStore.deleteGap(gapId);
      this.render();
      this.showToast('Gap record deleted.');
    }
  }

  // Full-Screen Evidence Image Lightbox
  openLightbox(gapId, index = 0) {
    const gap = window.gapDataStore.gaps.find(g => g.id === gapId);
    if (!gap || !Array.isArray(gap.images) || gap.images.length === 0) return;

    this.lightboxState = {
      gapId,
      index: Math.max(0, Math.min(index, gap.images.length - 1))
    };
    this.renderLightbox();
    const modal = document.getElementById('imageLightboxModal');
    if (modal) modal.classList.add('active');
  }

  renderLightbox() {
    const { gapId, index } = this.lightboxState;
    const gap = window.gapDataStore.gaps.find(g => g.id === gapId);
    if (!gap || !Array.isArray(gap.images) || gap.images.length === 0) {
      this.closeLightbox();
      return;
    }

    const safeIdx = Math.max(0, Math.min(index, gap.images.length - 1));
    this.lightboxState.index = safeIdx;
    const img = gap.images[safeIdx];
    const sec = window.gapDataStore.getSectionById(gap.sectionId);

    document.getElementById('lightboxImage').src = img.dataUrl;
    document.getElementById('lightboxTitle').innerText = `${gap.title}`;
    document.getElementById('lightboxMeta').innerText = `${sec ? sec.name : ''} • ${gap.date} • Photo ${safeIdx + 1} of ${gap.images.length} (${img.name || 'evidence.jpg'})`;

    const prevBtn = document.getElementById('lightboxPrevBtn');
    const nextBtn = document.getElementById('lightboxNextBtn');
    const showNav = gap.images.length > 1;
    if (prevBtn) prevBtn.style.display = showNav ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = showNav ? 'flex' : 'none';

    const dlBtn = document.getElementById('lightboxDownloadBtn');
    if (dlBtn) {
      dlBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = img.dataUrl;
        a.download = img.name || `${gap.id}_photo_${safeIdx + 1}.jpg`;
        a.click();
      };
    }

    const delBtn = document.getElementById('lightboxDeleteBtn');
    if (delBtn) {
      delBtn.onclick = () => {
        if (confirm('Remove this evidence photo from the false finding?')) {
          window.gapDataStore.removeImageFromGap(gap.id, img.id);
          this.render();
          const updatedGap = window.gapDataStore.gaps.find(g => g.id === gap.id);
          if (!updatedGap || !updatedGap.images || updatedGap.images.length === 0) {
            this.closeLightbox();
          } else {
            this.lightboxState.index = Math.min(safeIdx, updatedGap.images.length - 1);
            this.renderLightbox();
          }
          this.showToast('Evidence photo removed.');
        }
      };
    }
  }

  navigateLightbox(delta) {
    const gap = window.gapDataStore.gaps.find(g => g.id === this.lightboxState.gapId);
    if (!gap || !Array.isArray(gap.images) || gap.images.length <= 1) return;
    const len = gap.images.length;
    this.lightboxState.index = (this.lightboxState.index + delta + len) % len;
    this.renderLightbox();
  }

  closeLightbox() {
    const modal = document.getElementById('imageLightboxModal');
    if (modal) modal.classList.remove('active');
    const imgEl = document.getElementById('lightboxImage');
    if (imgEl) imgEl.src = '';
  }

  // Registry / All Gaps Table
  renderRegistry() {
    const list = document.getElementById('registryTableBody');
    if (!list) return;

    const filterSec = document.getElementById('registryFilterSection').value;
    const filterStatus = document.getElementById('registryFilterStatus').value;
    const searchVal = document.getElementById('registrySearch').value.toLowerCase().trim();

    let gaps = [...window.gapDataStore.gaps];

    if (filterSec && filterSec !== 'all') {
      gaps = gaps.filter(g => g.sectionId === filterSec);
    }
    if (filterStatus && filterStatus !== 'all') {
      gaps = gaps.filter(g => g.status === filterStatus);
    }
    if (searchVal) {
      gaps = gaps.filter(g => 
        g.title.toLowerCase().includes(searchVal) || 
        g.description.toLowerCase().includes(searchVal) ||
        g.auditor.toLowerCase().includes(searchVal)
      );
    }

    if (gaps.length === 0) {
      list.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #94a3b8;">No matching gap records found.</td></tr>`;
      return;
    }

    let html = '';
    gaps.forEach(g => {
      const sec = window.gapDataStore.getSectionById(g.sectionId);
      const sevClass = g.severity === 'Critical' ? 'crit' : (g.severity === 'Major' ? 'maj' : 'min');
      const photoCount = Array.isArray(g.images) ? g.images.length : 0;
      const photoBadge = photoCount > 0
        ? ` <button class="btn btn-secondary btn-sm" style="padding: 0.1rem 0.45rem; font-size: 0.7rem; margin-left: 0.35rem;" onclick="app.openLightbox('${g.id}', 0)" title="Preview evidence photos">📷 ${photoCount}</button>`
        : '';
      html += `
        <tr>
          <td><span class="sec-code-badge">${sec ? sec.code : '-'}</span> <strong>${sec ? sec.name : ''}</strong></td>
          <td><strong>${g.title}</strong>${photoBadge}<div style="font-size: 0.725rem; color: #64748b;">${(g.description || '').substring(0, 70)}${g.description && g.description.length > 70 ? '...' : ''}</div></td>
          <td>${g.date}</td>
          <td><span class="sev-pill ${sevClass}">${g.severity}</span></td>
          <td><span style="font-weight: 700; color: ${g.status === 'Resolved' ? '#16a34a' : '#dc2626'}">${g.status}</span></td>
          <td>${g.auditor}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="app.openSectionDetailsModal('${g.sectionId}')">View</button>
          </td>
        </tr>
      `;
    });
    list.innerHTML = html;
  }

  downloadExcel() {
    const xlsxBytes = window.gapDataStore.exportExcel(this.currentPeriod);
    const blob = new Blob([xlsxBytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rmp_gap_analysis_${this.currentPeriod}_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.showToast('Excel workbook (.xlsx) exported successfully!');
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✓</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.app = new GapApp();
});
