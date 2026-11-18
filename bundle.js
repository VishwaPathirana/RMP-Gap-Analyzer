const fs = require('fs');

const css = fs.readFileSync('css/styles.css', 'utf8');
const dataJs = fs.readFileSync('js/data.js', 'utf8');
const chartJs = fs.readFileSync('js/chart.js', 'utf8');
const appJs = fs.readFileSync('js/app.js', 'utf8');
const logoB64 = fs.readFileSync('assets/rmp-logo.png').toString('base64');
const faviconB64 = fs.readFileSync('assets/rmp-favicon.png').toString('base64');

// Read the clean base index.html
let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RMP Gap Analyzer - 14 Plant Sections & Inspection System</title>
  <link rel="icon" type="image/png" href="data:image/png;base64,${faviconB64}">
  <link rel="shortcut icon" type="image/png" href="data:image/png;base64,${faviconB64}">
  <link rel="apple-touch-icon" href="data:image/png;base64,${faviconB64}">
  <style>
${css}
  </style>
</head>
<body>

  <!-- Top Application Header -->
  <header class="app-header">
    <div class="brand-wrapper">
      <div class="brand-icon"><img src="data:image/png;base64,${logoB64}" alt="RMP Logo"></div>
      <div class="brand-text">
        <h1>
          RMP Gap Analyzer
          <span class="brand-tag">Plant Inspection</span>
        </h1>
        <div class="brand-sub">Section-wise False (Defect) Tracker & Time Period Analytics</div>
      </div>
    </div>
    <div class="header-actions">
      <button class="btn btn-danger-outline btn-sm" id="clearDataBtn" title="Clear all recorded gaps and start fresh">
        🗑️ Clear All Data
      </button>
      <button class="btn btn-excel btn-sm" id="exportExcelBtn" title="Export styled Excel workbook (.xlsx)">
        📗 Export Excel
      </button>
      <button class="btn btn-primary btn-sm" id="openAddGapBtn">
        + Log New Gap
      </button>
    </div>
  </header>

  <!-- Navigation Bar (Pages) -->
  <nav class="nav-bar">
    <div class="nav-tabs">
      <button class="nav-tab active" data-view="table">
        <span>📋</span> Section Gap Tracker
        <span class="badge" id="tabBadge14">14 Sections</span>
      </button>
      <button class="nav-tab" data-view="chart">
        <span>📊</span> Bar Chart & Analytics
      </button>
      <button class="nav-tab" data-view="registry">
        <span>📑</span> All Gaps Registry
      </button>
    </div>
    <div class="blueprint-badge">
      <span>📐</span> Blueprint: 14 Sections Architecture
    </div>
  </nav>

  <!-- Time Period Evaluation Bar (Directly from Blueprint Sketch) -->
  <div class="period-bar">
    <div class="period-group">
      <div class="period-label">
        <span>⏱️</span> Evaluation Period:
      </div>
      <div class="period-pills">
        <button class="period-btn active" data-period="2week">
          ⚡ As per 2 week
        </button>
        <button class="period-btn" data-period="month">
          📅 As per month
        </button>
        <button class="period-btn" data-period="year">
          📆 As per year
        </button>
        <button class="period-btn" data-period="all">
          🌐 All Records
        </button>
      </div>
    </div>
    <div class="period-date-display" id="periodDateDisplay">
      <span>📅</span> Showing Last 14 Days (Bi-weekly evaluation)
    </div>
  </div>

  <!-- Main Container -->
  <main class="container">

    <!-- KPI Summary Row -->
    <section class="kpi-grid" id="globalKpiGrid">
      <div class="kpi-card">
        <div class="kpi-info">
          <h3>Total Gaps (False)</h3>
          <div class="kpi-value" id="kpiTotalGaps">0</div>
          <div class="kpi-sub">Across evaluated sections</div>
        </div>
        <div class="kpi-icon red">⚠️</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-info">
          <h3>Facility Gap Rate</h3>
          <div class="kpi-value" id="kpiOverallRate">0.0%</div>
          <div class="kpi-sub">Total false vs total checkpoints</div>
        </div>
        <div class="kpi-icon amber">📉</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-info">
          <h3>Highest Gap Area</h3>
          <div class="kpi-value" id="kpiTopSection" style="font-size: 1.35rem;">-</div>
          <div class="kpi-sub">Needs primary corrective action</div>
        </div>
        <div class="kpi-icon blue">🏭</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-info">
          <h3>Active Open Gaps</h3>
          <div class="kpi-value" id="kpiOpenGaps">0</div>
          <div class="kpi-sub">Pending resolution</div>
        </div>
        <div class="kpi-icon green">🔧</div>
      </div>
    </section>

    <!-- VIEW 1: Section Gap Table (Page 1) -->
    <div class="view-panel active" id="view-table">
      <div class="sketch-banner">
        <div class="sketch-banner-text">
          💡 <strong>Blueprint Page 1:</strong> Section-wise gap count and percentage tracking across all <strong>14 plant sections</strong> (Yard A/B/C, Wet A/B/C, Milk, PDDC, DC, FGC, CC, Stores, Canteen, Outside Enviroment). Click <strong>"+ Add False"</strong> on any section to log findings.
        </div>
        <button class="btn btn-primary btn-sm" onclick="app.switchView('chart')">
          View Bar Chart →
        </button>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>
              <span>📋</span> Section-wise Gap Tally & Evaluation
            </h2>
            <p>Count of false inspection findings & calculated gap percentage per area</p>
          </div>
          <div class="card-actions">
            <button class="btn btn-excel btn-sm" onclick="app.downloadExcel()" title="Download Excel spreadsheet (.xlsx)">
              📗 Export Excel
            </button>
          </div>
        </div>

        <div class="card-body" style="padding: 0;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 40px;">#</th>
                  <th>Section (14 Plant Areas)</th>
                  <th style="width: 140px;">Count of Gap (False)</th>
                  <th style="width: 180px;">% Gap Rate</th>
                  <th style="width: 130px;">% Facility Share</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th style="text-align: right; width: 170px;">Action</th>
                </tr>
              </thead>
              <tbody id="sectionTableBody">
                <!-- Dynamically generated rows for 14 sections -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 2: Bar Chart & Analytics (Page 2) -->
    <div class="view-panel" id="view-chart">
      <div class="sketch-banner">
        <div class="sketch-banner-text">
          📊 <strong>Blueprint Page 2:</strong> Bar chart visualization with <strong>Sections on X-axis</strong> and <strong>% on Y-axis</strong>, dynamically evaluated <strong>(as per 2 week)</strong>, <strong>(as per month)</strong>, or <strong>(as per year)</strong>. Hover on any bar for detailed stats.
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>
              <span>📊</span> Section Gap Analysis Chart
              <span id="chartTitlePeriod" style="color: var(--primary); font-weight: 600;">(As per 2 week)</span>
            </h2>
            <p>Visual gap distribution across the 14 plant zones with benchmark threshold</p>
          </div>

          <div class="card-actions">
            <div class="chart-metric-switch">
              <button class="chart-metric-btn active" data-metric="percent">
                % Gap Rate
              </button>
              <button class="chart-metric-btn" data-metric="count">
                Count of Gaps
              </button>
            </div>
            <button class="btn btn-secondary btn-sm" id="togglePareto">
              📈 Pareto 80/20 View
            </button>
            <button class="btn btn-secondary btn-sm" id="exportChartBtn">
              📷 Export PNG
            </button>
          </div>
        </div>

        <div class="card-body">
          <!-- Section-wise Chart Filter Bar -->
          <div class="chart-section-filter-bar">
            <div class="chart-filter-top">
              <div class="chart-filter-left">
                <span class="chart-filter-label"><span>🏭</span> Filter Section:</span>
                <select class="form-control" id="chartSectionDropdown" onchange="app.onChartDropdownFilter(this.value)" style="width: auto; min-width: 220px; padding: 0.4rem 0.75rem; font-size: 0.825rem;">
                  <option value="all">All Sections (14)</option>
                </select>
              </div>
              <div class="chart-filter-right">
                <span class="chart-filter-count" id="chartFilterCountBadge">Showing 14 / 14 Sections</span>
                <button type="button" class="btn btn-secondary btn-sm" onclick="app.selectAllChartSections()">Select All</button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="app.selectGapOnlyChartSections()">With Gaps Only</button>
              </div>
            </div>
            <div class="section-chip-list" id="chartSectionChips">
              <!-- Dynamically rendered 14 section toggle chips -->
            </div>
          </div>

          <div class="canvas-container">
            <canvas id="gapBarChart"></canvas>
          </div>

          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-color good"></span>
              <span>Low Gaps (&lt; 5.0% - Within Tolerance)</span>
            </div>
            <div class="legend-item">
              <span class="legend-color warning"></span>
              <span>Moderate Gaps (5.0% - 15.0% - Action Needed)</span>
            </div>
            <div class="legend-item">
              <span class="legend-color critical"></span>
              <span>Critical Gaps (&gt; 15.0% - High Priority)</span>
            </div>
            <div class="legend-item">
              <span class="legend-color pareto"></span>
              <span>Pareto Cumulative % Line (80/20 Rule)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Insights Grid -->
      <div class="analytics-grid">
        <div class="card">
          <div class="card-header">
            <div class="card-title-group">
              <h2><span>🚨</span> Priority Defect Leaderboard</h2>
              <p>Top sections contributing the highest volume of false findings</p>
            </div>
          </div>
          <div class="card-body" style="padding: 0;">
            <div id="leaderboardList">
              <!-- Dynamically rendered top 5 sections -->
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title-group">
              <h2><span>🎯</span> Quality & Safety Rule</h2>
              <p>Target guidelines for plant auditing</p>
            </div>
          </div>
          <div class="card-body" style="font-size: 0.85rem; color: #334155; line-height: 1.6;">
            <p style="margin-bottom: 0.75rem;">
              <strong>Benchmark Standard:</strong> Maintain less than <strong>5.0% gap rate</strong> across all zones.
            </p>
            <ul style="padding-left: 1.25rem; margin-bottom: 0.75rem;">
              <li><strong>Critical Sections:</strong> Require immediate CAPA within 24 hours.</li>
              <li><strong>Bi-weekly Evaluations:</strong> Catch recurring wear and operational drift early.</li>
              <li><strong>Continuous Tracking:</strong> Every logged False updates the live Pareto analysis.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 3: All Gaps Registry (Page 3) -->
    <div class="view-panel" id="view-registry">
      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <h2><span>📑</span> Complete Defect & Gap Registry</h2>
            <p>All recorded non-conformances with corrective actions and status tracking</p>
          </div>
          <div class="card-actions">
            <button class="btn btn-primary btn-sm" onclick="app.openAddGapModal()">
              + Log New Gap
            </button>
          </div>
        </div>

        <div class="card-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label>Filter by Section</label>
              <select class="form-control" id="registryFilterSection" onchange="app.renderRegistry()">
                <option value="all">All Sections (14)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Filter by Status</label>
              <select class="form-control" id="registryFilterStatus" onchange="app.renderRegistry()">
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div class="form-group">
              <label>Search Findings</label>
              <input type="text" class="form-control" id="registrySearch" placeholder="Search keywords..." oninput="app.renderRegistry()">
            </div>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Title & Description</th>
                  <th>Date</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Auditor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="registryTableBody">
                <!-- Dynamically rendered -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 4: Full-Page Section Details -->
    <div class="view-panel" id="view-section-detail">
      <div class="section-detail-topbar">
        <div class="section-detail-title-group">
          <button class="btn btn-secondary" onclick="app.goBackFromSectionDetail()">
            ← Back
          </button>
          <div>
            <h2 id="secPageTitle">Section Name</h2>
            <div class="section-detail-subtitle" id="secPageCat">Category &amp; Description</div>
          </div>
        </div>
        <div class="section-detail-actions">
          <select class="form-control" id="secPageSwitcher" onchange="app.openSectionDetailsModal(this.value)" style="width: auto; min-width: 210px;" title="Jump to another section">
            <!-- Dynamically populated -->
          </select>
          <button class="btn btn-primary" id="secPageAddGapBtn">
            + Add False / Gap
          </button>
        </div>
      </div>

      <!-- Full-Page Section KPI Row -->
      <section class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-info">
            <h3>Total Gaps (False)</h3>
            <div class="kpi-value" id="secPageCount" style="color: #dc2626;">0</div>
            <div class="kpi-sub">In active evaluation period</div>
          </div>
          <div class="kpi-icon red">⚠️</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-info">
            <h3>Gap Rate (%)</h3>
            <div class="kpi-value" id="secPageRate" style="color: var(--primary);">0%</div>
            <div class="kpi-sub" id="secPageChecksSub">Evaluated checkpoints</div>
          </div>
          <div class="kpi-icon blue">📉</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-info">
            <h3>Open Gaps</h3>
            <div class="kpi-value" id="secPageOpen" style="color: #d97706;">0</div>
            <div class="kpi-sub">Pending resolution</div>
          </div>
          <div class="kpi-icon amber">🔧</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-info">
            <h3>Resolved Gaps</h3>
            <div class="kpi-value" id="secPageResolved" style="color: #059669;">0</div>
            <div class="kpi-sub">Completed corrective actions</div>
          </div>
          <div class="kpi-icon green">✓</div>
        </div>
      </section>

      <!-- Recorded Gaps Full-Page Card -->
      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <h2><span>📋</span> Recorded Gaps in Current Evaluation Period</h2>
            <p id="secPagePeriodNote">Full list of false findings, corrective actions, and resolution controls</p>
          </div>
          <div class="card-actions">
            <select class="form-control" id="secPageStatusFilter" onchange="app.renderSectionDetailsPage()" style="width: auto;">
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div class="card-body">
          <div id="secPageGapsList">
            <!-- Dynamically populated full-page cards -->
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- MODAL: Add New Gap / False -->
  <div class="modal-overlay" id="newGapModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">
          <span>⚠️</span> Log False Finding / Gap
        </h3>
        <button class="modal-close" onclick="app.closeModal('newGapModal')">&times;</button>
      </div>

      <form id="newGapForm">
        <div class="modal-body">
          <div class="form-group" style="margin-bottom: 1rem;">
            <label>Plant Section *</label>
            <select class="form-control" id="gapSectionSelect" required>
              <!-- Filled dynamically -->
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label>Defect Title / Gap Name *</label>
            <input type="text" class="form-control" id="gapTitle" required placeholder="e.g. Broken drainage cover, temperature drift">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label>Date Identified *</label>
              <input type="date" class="form-control" id="gapDate" required>
            </div>
            <div class="form-group">
              <label>Severity Level *</label>
              <select class="form-control" id="gapSeverity">
                <option value="Minor">Minor (Observation)</option>
                <option value="Major" selected>Major (Non-conformance)</option>
                <option value="Critical">Critical (Immediate Hazard)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label>Category *</label>
              <select class="form-control" id="gapCategory">
                <option value="Hygiene">Hygiene & Sanitation</option>
                <option value="Safety">Safety & PPE</option>
                <option value="Equipment">Equipment & Calibration</option>
                <option value="Facility">Facility & Maintenance</option>
                <option value="Pest Control">Pest Control</option>
                <option value="Environment">Environment & Waste</option>
                <option value="Compliance">Documentation & Logs</option>
                <option value="5S">5S Organization</option>
              </select>
            </div>
            <div class="form-group">
              <label>Auditor / Inspector</label>
              <input type="text" class="form-control" id="gapAuditor" value="Lead Inspector">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label>Detailed Description</label>
            <textarea class="form-control" id="gapDesc" rows="3" placeholder="Provide full details of the gap observed..."></textarea>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label>Corrective Action / Remediation</label>
            <textarea class="form-control" id="gapAction" rows="2" placeholder="Recommended fix, work order, or SOP assignment..."></textarea>
          </div>

          <div class="form-group">
            <label>Evidence Photos (Optional)</label>
            <div class="image-upload-zone" id="gapImageDropZone" onclick="document.getElementById('gapImageInput').click()">
              <div class="image-upload-icon">📷</div>
              <div class="image-upload-text">Click to upload or drag &amp; drop photos here</div>
              <div class="image-upload-hint">Supports JPG, PNG, WebP (multiple images allowed, auto-optimized)</div>
            </div>
            <input type="file" id="gapImageInput" accept="image/*" multiple style="display: none;">
            <div class="upload-preview-grid" id="gapImagePreviewList"></div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('newGapModal')">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Gap Finding</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Hidden file input for attaching photos to existing false findings -->
  <input type="file" id="existingGapPhotoInput" accept="image/*" multiple style="display: none;">

  <!-- LIGHTBOX: Full-Screen Evidence Image Preview -->
  <div class="lightbox-overlay" id="imageLightboxModal" onclick="if (event.target === this) app.closeLightbox()">
    <div class="lightbox-topbar">
      <div>
        <div class="lightbox-caption-title" id="lightboxTitle">Evidence Photo</div>
        <div class="lightbox-caption-sub" id="lightboxMeta">1 / 1</div>
      </div>
      <div class="lightbox-controls">
        <button type="button" class="btn btn-secondary btn-sm" id="lightboxDownloadBtn">⬇ Download</button>
        <button type="button" class="btn btn-secondary btn-sm" style="color: #dc2626;" id="lightboxDeleteBtn">🗑 Remove Photo</button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="app.closeLightbox()">✕ Close</button>
      </div>
    </div>

    <button type="button" class="lightbox-nav-btn prev" id="lightboxPrevBtn" onclick="app.navigateLightbox(-1)">‹</button>
    <div class="lightbox-stage">
      <img id="lightboxImage" src="" alt="Evidence photo preview">
    </div>
    <button type="button" class="lightbox-nav-btn next" id="lightboxNextBtn" onclick="app.navigateLightbox(1)">›</button>
  </div>

  <!-- Toast Notification Container -->
  <div class="toast-container" id="toastContainer"></div>

  <!-- Embedded Zero-Dependency Scripts (Guaranteed 100% Offline & File-Protocol Execution) -->
  <script>
${dataJs}
  </script>
  <script>
${chartJs}
  </script>
  <script>
${appJs}
  </script>

</body>
</html>
`;

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully generated bundled index.html (' + html.length + ' bytes)');
