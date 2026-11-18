// RMP Gap Analyzer - Core Data & Storage Management
// Specifically mapped from plant audit blueprint (14 Sections & Time Period Evaluations)

const STORAGE_KEY = 'rmp_gap_analyzer_v1';

// The 14 plant sections exactly as defined on the blueprint
const DEFAULT_SECTIONS = [
  { id: 'sec-1', code: 'YRD-A', name: 'Yard A', category: 'Yards & Logistics', icon: 'truck', desc: 'Raw material intake, primary yard & bay area' },
  { id: 'sec-2', code: 'YRD-B', name: 'Yard B', category: 'Yards & Logistics', icon: 'truck', desc: 'Secondary storage yard, pallet stacking & circulation' },
  { id: 'sec-3', code: 'YRD-C', name: 'Yard C', category: 'Yards & Logistics', icon: 'truck', desc: 'Vehicle parking, waste staging & container bay' },
  { id: 'sec-4', code: 'WET-A', name: 'Wet A', category: 'Wet Processing', icon: 'droplets', desc: 'Washing, raw processing & preliminary wet area' },
  { id: 'sec-5', code: 'WET-B', name: 'Wet B', category: 'Wet Processing', icon: 'droplets', desc: 'Main liquid processing, CIP & wet blending lines' },
  { id: 'sec-6', code: 'WET-C', name: 'Wet C', category: 'Wet Processing', icon: 'droplets', desc: 'Filtration, separation & drainage treatment area' },
  { id: 'sec-7', code: 'MLK', name: 'Milk', category: 'Dairy Processing', icon: 'milk', desc: 'Milk reception, chilling, storage silos & pasteurization' },
  { id: 'sec-8', code: 'PDDC', name: 'PDDC', category: 'Dairy Processing', icon: 'flask', desc: 'Product Development & Dairy Center / Drying unit' },
  { id: 'sec-9', code: 'DC', name: 'DC', category: 'Dispatch & Store', icon: 'archive', desc: 'Distribution Center, sorting & order dispatch' },
  { id: 'sec-10', code: 'FGC', name: 'FGC', category: 'Finished Goods', icon: 'package-check', desc: 'Finished Goods Center & temperature-controlled bay' },
  { id: 'sec-11', code: 'CC', name: 'CC', category: 'Cooling / Control', icon: 'thermometer-snowflake', desc: 'Cold Chain / Central Control cooling systems' },
  { id: 'sec-12', code: 'STR', name: 'Stores', category: 'Warehouse', icon: 'layers', desc: 'General raw material, packaging & chemical storage' },
  { id: 'sec-13', code: 'CNT', name: 'Canteen', category: 'Welfare & Catering', icon: 'utensils', desc: 'Staff canteen, dining hall & food preparation area' },
  { id: 'sec-14', code: 'OUT', name: 'Outside Enviroment', category: 'Environment', icon: 'trees', desc: 'Perimeter fencing, drainage channels & outdoor grounds' }
];

// Helper to format a Date object as local YYYY-MM-DD
function formatLocalDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Helper to generate seed dates relative to today's live local date
function getDateOffset(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return formatLocalDate(d);
}

// Generate rich sample data across 2-week, month, and year periods
function generateSeedGaps() {
  return [
    // --- 2-WEEK PERIOD (0 - 13 days ago: Nov 04 - Nov 17, 2026) ---
    {
      id: 'gap-001',
      sectionId: 'sec-1',
      date: getDateOffset(1),
      title: 'Oil spillage in raw intake bay',
      category: 'Safety',
      severity: 'Major',
      status: 'Open',
      auditor: 'Kamal Perera',
      description: 'Hydraulic oil leakage detected near intake bay 2. Slip hazard identified.',
      correctiveAction: 'Apply absorbent granules immediately and service forklift hydraulic seal.',
      isFalse: true
    },
    {
      id: 'gap-002',
      sectionId: 'sec-1',
      date: getDateOffset(5),
      title: 'Damaged guard rail near ramp',
      category: 'Facility',
      severity: 'Minor',
      status: 'In Progress',
      auditor: 'Nimal Silva',
      description: 'End section of pedestrian yellow guard rail bent outward.',
      correctiveAction: 'Work order sent to engineering for welding and re-anchoring.',
      isFalse: true
    },
    {
      id: 'gap-003',
      sectionId: 'sec-2',
      date: getDateOffset(3),
      title: 'Pallet stack exceeding height limit',
      category: 'Safety',
      severity: 'Major',
      status: 'Open',
      auditor: 'Kamal Perera',
      description: 'Wooden pallets stacked 22 high against maximum standard of 15.',
      correctiveAction: 'Re-stack pallets according to safety guidelines; brief yard operators.',
      isFalse: true
    },
    {
      id: 'gap-004',
      sectionId: 'sec-4',
      date: getDateOffset(2),
      title: 'Standing water pool near wash station',
      category: 'Hygiene',
      severity: 'Critical',
      status: 'Open',
      auditor: 'Dr. Fernando',
      description: 'Floor slope issue causing standing water pool near wash conveyor exit.',
      correctiveAction: 'Clear floor drain trap and inspect drainage incline with civil team.',
      isFalse: true
    },
    {
      id: 'gap-005',
      sectionId: 'sec-4',
      date: getDateOffset(8),
      title: 'CIP chemical dosing log missing',
      category: 'Compliance',
      severity: 'Major',
      status: 'Resolved',
      auditor: 'Sunil Jayawardena',
      description: 'Evening shift chemical concentration log was incomplete.',
      correctiveAction: 'Log completed retrospectively from DCS historian; operator coached.',
      isFalse: true
    },
    {
      id: 'gap-006',
      sectionId: 'sec-5',
      date: getDateOffset(4),
      title: 'Gasket weep on valve manifold V-104',
      category: 'Equipment',
      severity: 'Major',
      status: 'In Progress',
      auditor: 'Dr. Fernando',
      description: 'Minor moisture seepage detected on blend line butterfly valve seal.',
      correctiveAction: 'Replace food-grade EPDM gasket during weekend scheduled shutdown.',
      isFalse: true
    },
    {
      id: 'gap-007',
      sectionId: 'sec-7',
      date: getDateOffset(2),
      title: 'Silo 3 temperature probe drift',
      category: 'Equipment',
      severity: 'Critical',
      status: 'Open',
      auditor: 'Dr. Fernando',
      description: 'Dual probe discrepancy: Probe A reads 4.2C while Probe B reads 5.8C.',
      correctiveAction: 'Perform reference calibration check and replace faulty RTD sensor.',
      isFalse: true
    },
    {
      id: 'gap-008',
      sectionId: 'sec-8',
      date: getDateOffset(7),
      title: 'Dust accumulation on spray dryer exhaust hood',
      category: 'Hygiene',
      severity: 'Minor',
      status: 'Resolved',
      auditor: 'Anura Bandara',
      description: 'Fine dairy powder residue settled on upper extraction hood.',
      correctiveAction: 'Vacuum cleaned and included in daily sanitation checklist.',
      isFalse: true
    },
    {
      id: 'gap-009',
      sectionId: 'sec-9',
      date: getDateOffset(6),
      title: 'Dispatch roller conveyor sensor misaligned',
      category: 'Equipment',
      severity: 'Minor',
      status: 'Resolved',
      auditor: 'Kamal Perera',
      description: 'Photoelectric sensor on Lane 3 causing intermittent conveyor stoppage.',
      correctiveAction: 'Optical sensor realigned and cleaned with isopropyl alcohol.',
      isFalse: true
    },
    {
      id: 'gap-010',
      sectionId: 'sec-10',
      date: getDateOffset(9),
      title: 'Carton labeling barcode scan failure',
      category: 'Quality',
      severity: 'Minor',
      status: 'Resolved',
      auditor: 'Nimal Silva',
      description: 'Thermal print ribbon faint on batch #20261108.',
      correctiveAction: 'Thermal printhead cleaned and heat setting adjusted +2.',
      isFalse: true
    },
    {
      id: 'gap-011',
      sectionId: 'sec-11',
      date: getDateOffset(3),
      title: 'Cold room air curtain velocity below spec',
      category: 'Facility',
      severity: 'Major',
      status: 'Open',
      auditor: 'Kamal Perera',
      description: 'Inflow air curtain over entrance door measuring 2.1 m/s (spec >= 3.5 m/s).',
      correctiveAction: 'Service intake fan blower motor and inspect air ducting.',
      isFalse: true
    },
    {
      id: 'gap-012',
      sectionId: 'sec-12',
      date: getDateOffset(10),
      title: 'Chemical drum bund capacity exceeded',
      category: 'Safety',
      severity: 'Critical',
      status: 'In Progress',
      auditor: 'Sunil Jayawardena',
      description: 'Extra disinfectant drums stored inside spill bund leaving < 110% volume.',
      correctiveAction: 'Transfer surplus drums to external approved chemical storage.',
      isFalse: true
    },
    {
      id: 'gap-013',
      sectionId: 'sec-13',
      date: getDateOffset(11),
      title: 'Hand wash station soap dispenser empty',
      category: 'Hygiene',
      severity: 'Minor',
      status: 'Resolved',
      auditor: 'Anura Bandara',
      description: 'Canteen entry hygiene wash station had depleted antibacterial soap.',
      correctiveAction: 'Refilled immediately; housekeeping shift hand-off checklist updated.',
      isFalse: true
    },
    {
      id: 'gap-014',
      sectionId: 'sec-14',
      date: getDateOffset(5),
      title: 'Broken pest mesh over storm drain outlet',
      category: 'Pest Control',
      severity: 'Major',
      status: 'Open',
      auditor: 'Nimal Silva',
      description: 'Stainless steel rodent mesh torn at eastern perimeter culvert.',
      correctiveAction: 'Replace mesh panel and inspect adjacent grounds for burrows.',
      isFalse: true
    },

    // --- MONTH PERIOD (14 - 30 days ago: Oct 18 - Nov 03, 2026) ---
    {
      id: 'gap-015',
      sectionId: 'sec-1',
      date: getDateOffset(18),
      title: 'Intake bay illumination fixture non-functional',
      category: 'Facility',
      severity: 'Minor',
      status: 'Resolved',
      auditor: 'Kamal Perera',
      description: 'LED floodlight #4 flickering on off-loading bay.',
      correctiveAction: 'Replaced LED ballast and sealed IP65 enclosure.',
      isFalse: true
    },
    {
      id: 'gap-016',
      sectionId: 'sec-3',
      date: getDateOffset(22),
      title: 'Scrap metal bin overflowing in Yard C',
      category: '5S',
      severity: 'Minor',
      status: 'Resolved',
      auditor: 'Nimal Silva',
      description: 'Waste segregation bins not cleared prior to weekend.',
      correctiveAction: 'Contractor pickup scheduled every Thursday afternoon.',
      isFalse: true
    },
    {
      id: 'gap-017',
      sectionId: 'sec-4',
      date: getDateOffset(16),
      title: 'Floor sanitization log gap',
      category: 'Hygiene',
      severity: 'Major',
      status: 'Resolved',
      auditor: 'Dr. Fernando',
      description: 'Missing 2 PM sanitization verification initial.',
      correctiveAction: 'Re-briefed section team on mandatory audit sign-offs.',
      isFalse: true
    },
    {
      id: 'gap-018',
      sectionId: 'sec-5',
      date: getDateOffset(25),
      title: 'Steam trap leak in Wet B blending unit',
      category: 'Equipment',
      severity: 'Major',
      status: 'Resolved',
      auditor: 'Sunil Jayawardena',
      description: 'Thermodynamic steam trap blowing through continuously.',
      correctiveAction: 'Replaced trap capsule with genuine Spirax Sarco spare.',
      isFalse: true
    },
    {
      id: 'gap-019',
      sectionId: 'sec-6',
      date: getDateOffset(20),
      title: 'Effluent pH probe calibration expired',
      category: 'Environment',
      severity: 'Critical',
      status: 'Resolved',
      auditor: 'Dr. Fernando',
      description: 'Online pH electrode overdue for 14-day 2-point buffer check.',
      correctiveAction: 'Calibrated with pH 4.01 and 7.00 reference standards.',
      isFalse: true
    },
    {
      id: 'gap-020',
      sectionId: 'sec-7',
      date: getDateOffset(27),
      title: 'Milk intake sampling valve sanitize interval missed',
      category: 'Hygiene',
      severity: 'Major',
      status: 'Resolved',
      auditor: 'Dr. Fernando',
      description: 'Aseptic sampling port alcohol spray verification overdue.',
      correctiveAction: 'Steam sterilized port and logged swab culture test.',
      isFalse: true
    },
    {
      id: 'gap-021',
      sectionId: 'sec-11',
      date: getDateOffset(24),
      title: 'Refrigerant R-134a pressure drop alarm',
      category: 'Equipment',
      severity: 'Critical',
      status: 'Resolved',
      auditor: 'Kamal Perera',
      description: 'Condenser circuit 2 low suction pressure trip at 03:15 AM.',
      correctiveAction: 'Pin-point ultrasonic leak test located flare nut leak; tightened and recharged.',
      isFalse: true
    },
    {
      id: 'gap-022',
      sectionId: 'sec-13',
      date: getDateOffset(19),
      title: 'Food temperature log not recorded for lunch service',
      category: 'Compliance',
      severity: 'Major',
      status: 'Resolved',
      auditor: 'Anura Bandara',
      description: 'Bain-marie holding temperature (target > 65C) not recorded at 12:30.',
      correctiveAction: 'Canteen supervisor reminded of regulatory food safety requirement.',
      isFalse: true
    },
    {
      id: 'gap-023',
      sectionId: 'sec-14',
      date: getDateOffset(29),
      title: 'Vegetation overgrowth touching perimeter security sensor',
      category: 'Facility',
      severity: 'Minor',
      status: 'Resolved',
      auditor: 'Nimal Silva',
      description: 'Branches triggering false perimeter beam sensor alarm.',
      correctiveAction: 'Landscaping crew pruned 1-meter clearance around perimeter line.',
      isFalse: true
    },

    // --- YEAR PERIOD (31 - 365 days ago) ---
    {
      id: 'gap-024',
      sectionId: 'sec-1',
      date: getDateOffset(60),
      title: 'Pothole at Yard A main entrance gate',
      category: 'Facility',
      severity: 'Major',
      status: 'Resolved',
      auditor: 'Kamal Perera',
      description: 'Heavy truck axle movement caused 10cm deep asphalt depression.',
      correctiveAction: 'Cold-mix asphalt patch laid and compacted.',
      isFalse: true
    },
    {
      id: 'gap-025',
      sectionId: 'sec-2',
      date: getDateOffset(120),
      title: 'Missing wheel chocks at bay 6',
      category: 'Safety',
      severity: 'Major',
      status: 'Resolved',
      auditor: 'Nimal Silva',
      description: 'Safety chocks absent from designated dock hook.',
      correctiveAction: 'Chocks attached with high-tensile steel cable to dock frame.',
      isFalse: true
    },
    {
      id: 'gap-026',
      sectionId: 'sec-4',
      date: getDateOffset(90),
      title: 'Corrosion on wet line pump baseplate',
      category: 'Equipment',
      severity: 'Major',
      status: 'Resolved',
      auditor: 'Dr. Fernando',
      description: 'Surface oxidation underneath sanitary centrifugal pump P-201.',
      correctiveAction: 'Cleaned, treated with rust inhibitor, and coated with epoxy paint.',
      isFalse: true
    },
    {
      id: 'gap-027',
      sectionId: 'sec-5',
      date: getDateOffset(150),
      title: 'Wet B emergency eyewash inspection tag missing',
      category: 'Safety',
      severity: 'Major',
      status: 'Resolved',
      auditor: 'Sunil Jayawardena',
      description: 'Monthly flush and pressure check verification tag detached.',
      correctiveAction: 'Eyewash tested for 3 min continuous flush; laminated tag attached.',
      isFalse: true
    },
    {
      id: 'gap-028',
      sectionId: 'sec-7',
      date: getDateOffset(85),
      title: 'Raw milk receiving line CIP spray ball blocked',
      category: 'Hygiene',
      severity: 'Critical',
      status: 'Resolved',
      auditor: 'Dr. Fernando',
      description: 'One quadrant nozzle of rotating spray ball partially clogged with scale.',
      correctiveAction: 'Acid descaling performed; spray ball disassembled and inspected.',
      isFalse: true
    },
    {
      id: 'gap-029',
      sectionId: 'sec-8',
      date: getDateOffset(110),
      title: 'PDDC sample weighing balance out of calibration',
      category: 'Quality',
      severity: 'Major',
      status: 'Resolved',
      auditor: 'Anura Bandara',
      description: 'Standard 100g test weight read 99.82g on bench scale.',
      correctiveAction: 'External calibration agency recalled scale; zero balance re-adjusted.',
      isFalse: true
    },
    {
      id: 'gap-030',
      sectionId: 'sec-10',
      date: getDateOffset(70),
      title: 'FGC rapid roll door safety sensor malfunction',
      category: 'Safety',
      severity: 'Critical',
      status: 'Resolved',
      auditor: 'Kamal Perera',
      description: 'High-speed insulated door failed to reverse when obstacle placed underneath.',
      correctiveAction: 'Bottom safety edge sensor wiring repaired; fail-safe test verified.',
      isFalse: true
    },
    {
      id: 'gap-031',
      sectionId: 'sec-12',
      date: getDateOffset(140),
      title: 'Unlabeled chemical decanting bottle in Stores',
      category: 'Safety',
      severity: 'Critical',
      status: 'Resolved',
      auditor: 'Sunil Jayawardena',
      description: 'Secondary spray bottle found without GHS safety pictograms or contents name.',
      correctiveAction: 'Decanted bottle disposed; standard pre-printed labeled bottles enforced.',
      isFalse: true
    }
  ];
}

// Generate base total checkpoints per section to calculate percentage
// e.g. Yard A was evaluated on 20 checklist criteria
const SECTION_CHECKPOINT_COUNT = {
  'sec-1': 24,  // Yard A
  'sec-2': 18,  // Yard B
  'sec-3': 16,  // Yard C
  'sec-4': 28,  // Wet A
  'sec-5': 26,  // Wet B
  'sec-6': 22,  // Wet C
  'sec-7': 30,  // Milk
  'sec-8': 20,  // PDDC
  'sec-9': 20,  // DC
  'sec-10': 22, // FGC
  'sec-11': 24, // CC
  'sec-12': 18, // Stores
  'sec-13': 16, // Canteen
  'sec-14': 20  // Outside Environment
};

class GapDataManager {
  constructor() {
    this.sections = [];
    this.gaps = [];
    this.init();
  }

  init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.sections = parsed.sections || DEFAULT_SECTIONS;
        // Sync any updated section names and labels from DEFAULT_SECTIONS
        if (Array.isArray(this.sections)) {
          this.sections.forEach(s => {
            const def = DEFAULT_SECTIONS.find(d => d.id === s.id);
            if (def) {
              s.name = def.name;
              s.code = def.code;
              s.category = def.category;
            }
          });
        }
        this.gaps = Array.isArray(parsed.gaps) ? parsed.gaps : generateSeedGaps();
        return;
      }
    } catch (e) {
      console.warn('LocalStorage error, using defaults:', e);
    }
    this.resetToDefaults();
  }

  resetToDefaults() {
    this.sections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
    this.gaps = generateSeedGaps();
    this.save();
  }

  clearAllData() {
    this.gaps = [];
    this.save();
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sections: this.sections,
        gaps: this.gaps,
        lastUpdated: new Date().toISOString()
      }));
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
        alert('Browser storage limit reached! Try uploading fewer or smaller images, or deleting old resolved gaps.');
      }
      return false;
    }
  }

  getSections() {
    return this.sections;
  }

  getSectionById(id) {
    return this.sections.find(s => s.id === id);
  }

  /**
   * Filter gaps based on the specified blueprint time period:
   * - '2week' : last 14 days
   * - 'month' : last 30 days
   * - 'year'  : last 365 days / current year
   * - 'all'   : all records
   */
  filterGapsByPeriod(period = '2week', customFrom = null, customTo = null) {
    // Always use live current local date (end of today)
    const refDate = new Date();
    refDate.setHours(23, 59, 59, 999);

    return this.gaps.filter(gap => {
      if (period === 'all') return true;
      if (period === 'custom' && customFrom && customTo) {
        return gap.date >= customFrom && gap.date <= customTo;
      }

      const gapDate = new Date((gap.date || formatLocalDate(new Date())) + 'T00:00:00');
      const diffMs = refDate - gapDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (period === '2week') {
        return diffDays <= 14;
      } else if (period === 'month') {
        return diffDays <= 30;
      } else if (period === 'year') {
        return diffDays <= 365;
      }
      return true;
    });
  }

  /**
   * Calculate Section-wise Summary specifically for the table and bar chart:
   * Returns:
   * - Section
   * - Count of Gap (number of false items)
   * - % (Gap Rate: Gaps / Total Checkpoints * 100)
   * - % (Gap Share: Gaps in Section / Total Facility Gaps * 100)
   */
  getSectionAnalysis(period = '2week', customFrom = null, customTo = null) {
    const periodGaps = this.filterGapsByPeriod(period, customFrom, customTo);
    const totalGapsCount = periodGaps.length;

    // Checkpoint count multipliers based on period scale
    let periodMultiplier = 1;
    if (period === 'month') periodMultiplier = 2; // e.g. 2 audits in a month
    if (period === 'year') periodMultiplier = 24; // bi-weekly audits in a year
    if (period === 'all') periodMultiplier = 30;

    const summary = this.sections.map((section, idx) => {
      const sectionGaps = periodGaps.filter(g => g.sectionId === section.id && g.isFalse !== false);
      const countOfGap = sectionGaps.length;

      const baseChecks = SECTION_CHECKPOINT_COUNT[section.id] || 20;
      const totalChecks = baseChecks * periodMultiplier;

      // Rate %: Failure frequency (Gaps / Total evaluated checkpoints)
      const gapRatePercent = totalChecks > 0
        ? Math.round((countOfGap / totalChecks) * 1000) / 10
        : 0;

      // Share %: Contribution to overall facility gaps
      const gapSharePercent = totalGapsCount > 0
        ? Math.round((countOfGap / totalGapsCount) * 1000) / 10
        : 0;

      // Status assessment
      let statusLevel = 'good';
      if (countOfGap >= 3 || gapRatePercent >= 15) {
        statusLevel = 'critical';
      } else if (countOfGap >= 1 || gapRatePercent >= 5) {
        statusLevel = 'warning';
      }

      // Counts by severity
      const criticalGaps = sectionGaps.filter(g => g.severity === 'Critical').length;
      const majorGaps = sectionGaps.filter(g => g.severity === 'Major').length;
      const minorGaps = sectionGaps.filter(g => g.severity === 'Minor').length;

      // Open vs Resolved
      const openGaps = sectionGaps.filter(g => g.status === 'Open').length;
      const inProgressGaps = sectionGaps.filter(g => g.status === 'In Progress').length;
      const resolvedGaps = sectionGaps.filter(g => g.status === 'Resolved').length;

      return {
        number: idx + 1,
        id: section.id,
        code: section.code,
        name: section.name,
        category: section.category,
        countOfGap,
        totalChecks,
        gapRatePercent,
        gapSharePercent,
        statusLevel,
        criticalGaps,
        majorGaps,
        minorGaps,
        openGaps,
        inProgressGaps,
        resolvedGaps,
        gaps: sectionGaps
      };
    });

    // Facility totals
    const totalChecksAll = summary.reduce((sum, s) => sum + s.totalChecks, 0);
    const overallFacilityGapRate = totalChecksAll > 0
      ? Math.round((totalGapsCount / totalChecksAll) * 1000) / 10
      : 0;

    const topSection = [...summary].sort((a, b) => b.countOfGap - a.countOfGap)[0];
    const highestGapSection = (topSection && topSection.countOfGap > 0) ? topSection : null;

    return {
      period,
      totalGaps: totalGapsCount,
      totalChecks: totalChecksAll,
      overallGapRate: overallFacilityGapRate,
      highestGapSection,
      sections: summary
    };
  }

  // Add a new False / Gap record
  addGap(gap) {
    const newGap = {
      id: 'gap-' + Date.now(),
      date: gap.date || formatLocalDate(new Date()),
      sectionId: gap.sectionId,
      title: gap.title || 'Audit Gap Identified',
      category: gap.category || 'Hygiene',
      severity: gap.severity || 'Major',
      status: gap.status || 'Open',
      auditor: gap.auditor || 'Auditor',
      description: gap.description || '',
      correctiveAction: gap.correctiveAction || '',
      images: Array.isArray(gap.images) ? gap.images : [],
      isFalse: true
    };
    this.gaps.unshift(newGap);
    this.save();
    return newGap;
  }

  // Attach additional evidence images to an existing gap
  addImagesToGap(gapId, newImages) {
    const gap = this.gaps.find(g => g.id === gapId);
    if (!gap || !Array.isArray(newImages) || newImages.length === 0) return null;
    if (!Array.isArray(gap.images)) gap.images = [];
    gap.images.push(...newImages);
    this.save();
    return gap;
  }

  // Remove a single evidence image from a gap
  removeImageFromGap(gapId, imgId) {
    const gap = this.gaps.find(g => g.id === gapId);
    if (!gap || !Array.isArray(gap.images)) return null;
    gap.images = gap.images.filter(img => img.id !== imgId);
    this.save();
    return gap;
  }

  // Update existing gap
  updateGap(id, updateData) {
    const index = this.gaps.findIndex(g => g.id === id);
    if (index !== -1) {
      this.gaps[index] = { ...this.gaps[index], ...updateData };
      this.save();
      return this.gaps[index];
    }
    return null;
  }

  // Delete gap
  deleteGap(id) {
    this.gaps = this.gaps.filter(g => g.id !== id);
    this.save();
  }

  // Export all data to JSON
  exportJSON() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      sections: this.sections,
      gaps: this.gaps
    }, null, 2);
  }

  // Import JSON data
  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.sections) && Array.isArray(data.gaps)) {
        this.sections = data.sections;
        this.gaps = data.gaps;
        this.save();
        return true;
      }
    } catch (e) {
      console.error('Import error:', e);
    }
    return false;
  }

  // Export current evaluation as a true multi-sheet Excel Workbook (.xlsx)
  // Zero-dependency OOXML (.xlsx) generator with styled sheets & Excel formulas
  exportExcel(period = '2week') {
    const analysis = this.getSectionAnalysis(period);
    const periodGaps = this.filterGapsByPeriod(period);
    const periodLabels = {
      '2week': 'As per 2 Week (Last 14 Days)',
      'month': 'As per Month (Last 30 Days)',
      'year': 'As per Year (Annual 2026)',
      'all': 'All Recorded Inspections'
    };
    const periodLabel = periodLabels[period] || period;
    const generatedAt = new Date().toLocaleString();

    const escXml = (val) => String(val == null ? '' : val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const colLetter = (idx) => {
      let s = '';
      let n = idx + 1;
      while (n > 0) {
        const m = (n - 1) % 26;
        s = String.fromCharCode(65 + m) + s;
        n = Math.floor((n - 1) / 26);
      }
      return s;
    };

    const strCell = (r, c, text, style = 3) =>
      `<c r="${colLetter(c)}${r}" t="inlineStr" s="${style}"><is><t>${escXml(text)}</t></is></c>`;

    const numCell = (r, c, val, style = 4) =>
      `<c r="${colLetter(c)}${r}" s="${style}"><v>${Number(val) || 0}</v></c>`;

    const formulaCell = (r, c, formula, cachedVal, style = 6) =>
      `<c r="${colLetter(c)}${r}" s="${style}"><f>${escXml(formula)}</f><v>${Number(cachedVal) || 0}</v></c>`;

    // --- SHEET 1: Section Summary ---
    const s1Rows = [];
    // Row 1: Title
    s1Rows.push(`<row r="1" ht="28" customHeight="1">${strCell(1, 0, `RMP GAP ANALYZER - SECTION SUMMARY (${periodLabel})`, 1)}</row>`);
    // Row 2: Subtitle
    s1Rows.push(`<row r="2" ht="20" customHeight="1">${strCell(2, 0, `Generated: ${generatedAt}  |  Total Gaps: ${analysis.totalGaps}  |  Facility Gap Rate: ${analysis.overallGapRate}%`, 0)}</row>`);
    // Row 4: Headers
    const s1Headers = [
      '#', 'Section Code', 'Section Name', 'Category',
      'Count of Gap (False)', 'Total Checks', 'Gap Rate (%)', 'Facility Share (%)',
      'Critical', 'Major', 'Minor', 'Open Gaps', 'Resolved', 'Status'
    ];
    s1Rows.push(`<row r="4" ht="24" customHeight="1">${s1Headers.map((h, i) => strCell(4, i, h, 2)).join('')}</row>`);

    // Rows 5..18: 14 Sections
    analysis.sections.forEach((s, idx) => {
      const r = 5 + idx;
      const statusStyle = s.statusLevel === 'critical' ? 8 : (s.statusLevel === 'warning' ? 9 : 10);
      const cells = [
        numCell(r, 0, s.number, 4),
        strCell(r, 1, s.code, 3),
        strCell(r, 2, s.name, 3),
        strCell(r, 3, s.category, 3),
        numCell(r, 4, s.countOfGap, 4),
        numCell(r, 5, s.totalChecks, 4),
        numCell(r, 6, (s.gapRatePercent / 100).toFixed(4), 5),
        numCell(r, 7, (s.gapSharePercent / 100).toFixed(4), 5),
        numCell(r, 8, s.criticalGaps, 4),
        numCell(r, 9, s.majorGaps, 4),
        numCell(r, 10, s.minorGaps, 4),
        numCell(r, 11, s.openGaps, 4),
        numCell(r, 12, s.resolvedGaps, 4),
        strCell(r, 13, s.statusLevel.toUpperCase(), statusStyle)
      ];
      s1Rows.push(`<row r="${r}" ht="20" customHeight="1">${cells.join('')}</row>`);
    });

    // Totals Row
    const lastSecRow = 4 + analysis.sections.length;
    const totRow = lastSecRow + 1;
    const totalCrit = analysis.sections.reduce((a, s) => a + s.criticalGaps, 0);
    const totalMaj = analysis.sections.reduce((a, s) => a + s.majorGaps, 0);
    const totalMin = analysis.sections.reduce((a, s) => a + s.minorGaps, 0);
    const totalOpen = analysis.sections.reduce((a, s) => a + s.openGaps, 0);
    const totalRes = analysis.sections.reduce((a, s) => a + s.resolvedGaps, 0);

    const totCells = [
      strCell(totRow, 0, '', 6),
      strCell(totRow, 1, 'TOTAL', 6),
      strCell(totRow, 2, `All ${analysis.sections.length} Sections`, 6),
      strCell(totRow, 3, 'Facility Overall', 6),
      formulaCell(totRow, 4, `SUM(E5:E${lastSecRow})`, analysis.totalGaps, 6),
      formulaCell(totRow, 5, `SUM(F5:F${lastSecRow})`, analysis.totalChecks, 6),
      formulaCell(totRow, 6, `IF(F${totRow}>0,E${totRow}/F${totRow},0)`, (analysis.overallGapRate / 100).toFixed(4), 7),
      formulaCell(totRow, 7, `SUM(H5:H${lastSecRow})`, analysis.totalGaps > 0 ? 1 : 0, 7),
      formulaCell(totRow, 8, `SUM(I5:I${lastSecRow})`, totalCrit, 6),
      formulaCell(totRow, 9, `SUM(J5:J${lastSecRow})`, totalMaj, 6),
      formulaCell(totRow, 10, `SUM(K5:K${lastSecRow})`, totalMin, 6),
      formulaCell(totRow, 11, `SUM(L5:L${lastSecRow})`, totalOpen, 6),
      formulaCell(totRow, 12, `SUM(M5:M${lastSecRow})`, totalRes, 6),
      strCell(totRow, 13, analysis.overallGapRate >= 15 ? 'CRITICAL' : (analysis.overallGapRate >= 5 ? 'WARNING' : 'GOOD'), 6)
    ];
    s1Rows.push(`<row r="${totRow}" ht="22" customHeight="1">${totCells.join('')}</row>`);

    const s1ColWidths = [5, 14, 22, 20, 20, 14, 15, 18, 11, 11, 11, 12, 12, 13];
    const s1ColsXml = `<cols>${s1ColWidths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`;

    const sheet1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  ${s1ColsXml}
  <sheetData>${s1Rows.join('')}</sheetData>
  <mergeCells count="2">
    <mergeCell ref="A1:N1"/>
    <mergeCell ref="A2:N2"/>
  </mergeCells>
</worksheet>`;

    // --- SHEET 2: Gap Findings Log ---
    const s2Rows = [];
    s2Rows.push(`<row r="1" ht="28" customHeight="1">${strCell(1, 0, `RMP GAP ANALYZER - DETAILED FALSE / GAP FINDINGS (${periodLabel})`, 1)}</row>`);
    const s2Headers = [
      'Gap ID', 'Date', 'Section Code', 'Section Name', 'Defect Title',
      'Category', 'Severity', 'Status', 'Auditor', 'Description', 'Corrective Action'
    ];
    s2Rows.push(`<row r="3" ht="24" customHeight="1">${s2Headers.map((h, i) => strCell(3, i, h, 2)).join('')}</row>`);

    periodGaps.forEach((g, idx) => {
      const r = 4 + idx;
      const sec = this.getSectionById(g.sectionId);
      const sevStyle = g.severity === 'Critical' ? 8 : (g.severity === 'Major' ? 9 : 3);
      const statStyle = g.status === 'Resolved' ? 10 : (g.status === 'Open' ? 8 : 9);
      const cells = [
        strCell(r, 0, g.id, 3),
        strCell(r, 1, g.date, 3),
        strCell(r, 2, sec ? sec.code : '-', 3),
        strCell(r, 3, sec ? sec.name : '-', 3),
        strCell(r, 4, g.title, 3),
        strCell(r, 5, g.category, 3),
        strCell(r, 6, g.severity, sevStyle),
        strCell(r, 7, g.status, statStyle),
        strCell(r, 8, g.auditor, 3),
        strCell(r, 9, g.description, 3),
        strCell(r, 10, g.correctiveAction, 3)
      ];
      s2Rows.push(`<row r="${r}" ht="20" customHeight="1">${cells.join('')}</row>`);
    });

    const s2ColWidths = [14, 13, 14, 20, 32, 16, 12, 14, 18, 42, 42];
    const s2ColsXml = `<cols>${s2ColWidths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`;

    const sheet2Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  ${s2ColsXml}
  <sheetData>${s2Rows.join('')}</sheetData>
  <mergeCells count="1">
    <mergeCell ref="A1:K1"/>
  </mergeCells>
</worksheet>`;

    // --- OOXML Stylesheet ---
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="7">
    <font><sz val="11"/><color rgb="FF0F172A"/><name val="Calibri"/></font>
    <font><b/><sz val="13"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FF0F172A"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF991B1B"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF92400E"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF065F46"/><name val="Calibri"/></font>
  </fonts>
  <fills count="8">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F172A"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E40AF"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE2E8F0"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEE2E2"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFD1FAE5"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
      <diagonal/>
    </border>
    <border>
      <left style="thin"><color rgb="FF94A3B8"/></left>
      <right style="thin"><color rgb="FF94A3B8"/></right>
      <top style="medium"><color rgb="FF334155"/></top>
      <bottom style="double"><color rgb="FF334155"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="11">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" horizontal="left"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>
    <xf numFmtId="10" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>
    <xf numFmtId="10" fontId="3" fillId="4" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>
    <xf numFmtId="0" fontId="4" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>
  </cellXfs>
</styleSheet>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Section Summary" sheetId="1" r:id="rId1"/>
    <sheet name="Gap Findings Log" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>`;

    const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

    // Pack into valid uncompressed ZIP (.xlsx)
    const files = [
      { name: '[Content_Types].xml', content: contentTypesXml },
      { name: '_rels/.rels', content: rootRelsXml },
      { name: 'xl/workbook.xml', content: workbookXml },
      { name: 'xl/_rels/workbook.xml.rels', content: workbookRelsXml },
      { name: 'xl/styles.xml', content: stylesXml },
      { name: 'xl/worksheets/sheet1.xml', content: sheet1Xml },
      { name: 'xl/worksheets/sheet2.xml', content: sheet2Xml }
    ];

    return this._createZipBytes(files);
  }

  // Minimal zero-dependency ZIP archive builder (Store method 0 + CRC32)
  _createZipBytes(files) {
    const encoder = new TextEncoder();

    // Build CRC32 lookup table
    const crcTable = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crcTable[i] = c >>> 0;
    }

    const calcCrc32 = (bytes) => {
      let crc = 0xFFFFFFFF;
      for (let i = 0; i < bytes.length; i++) {
        crc = crcTable[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
      }
      return (crc ^ 0xFFFFFFFF) >>> 0;
    };

    const localParts = [];
    const centralParts = [];
    let offset = 0;

    files.forEach(file => {
      const nameBytes = encoder.encode(file.name);
      const dataBytes = encoder.encode(file.content);
      const crc = calcCrc32(dataBytes);
      const size = dataBytes.length;

      // Local file header (30 bytes + filename)
      const localHeader = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(localHeader.buffer);
      lv.setUint32(0, 0x04034b50, true); // signature
      lv.setUint16(4, 20, true);         // version needed
      lv.setUint16(6, 0, true);          // flags
      lv.setUint16(8, 0, true);          // compression (0 = store)
      lv.setUint16(10, 0, true);         // mod time
      lv.setUint16(12, 0, true);         // mod date
      lv.setUint32(14, crc, true);       // crc32
      lv.setUint32(18, size, true);      // compressed size
      lv.setUint32(22, size, true);      // uncompressed size
      lv.setUint16(26, nameBytes.length, true); // filename len
      lv.setUint16(28, 0, true);         // extra field len
      localHeader.set(nameBytes, 30);

      localParts.push(localHeader, dataBytes);

      // Central directory header (46 bytes + filename)
      const centralHeader = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(centralHeader.buffer);
      cv.setUint32(0, 0x02014b50, true); // signature
      cv.setUint16(4, 20, true);         // version made by
      cv.setUint16(6, 20, true);         // version needed
      cv.setUint16(8, 0, true);          // flags
      cv.setUint16(10, 0, true);         // compression
      cv.setUint16(12, 0, true);         // mod time
      cv.setUint16(14, 0, true);         // mod date
      cv.setUint32(16, crc, true);       // crc32
      cv.setUint32(20, size, true);      // compressed size
      cv.setUint32(24, size, true);      // uncompressed size
      cv.setUint16(28, nameBytes.length, true); // filename len
      cv.setUint16(30, 0, true);         // extra len
      cv.setUint16(32, 0, true);         // comment len
      cv.setUint16(34, 0, true);         // disk start
      cv.setUint16(36, 0, true);         // internal attr
      cv.setUint32(38, 0, true);         // external attr
      cv.setUint32(42, offset, true);    // local header offset
      centralHeader.set(nameBytes, 46);

      centralParts.push(centralHeader);
      offset += localHeader.length + dataBytes.length;
    });

    const centralSize = centralParts.reduce((acc, p) => acc + p.length, 0);

    // End of central directory record (22 bytes)
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);       // signature
    ev.setUint16(4, 0, true);                // disk number
    ev.setUint16(6, 0, true);                // central dir start disk
    ev.setUint16(8, files.length, true);     // entries on disk
    ev.setUint16(10, files.length, true);    // total entries
    ev.setUint32(12, centralSize, true);     // central dir size
    ev.setUint32(16, offset, true);          // central dir offset
    ev.setUint16(20, 0, true);               // comment len

    // Concatenate all byte arrays
    const totalLength = offset + centralSize + eocd.length;
    const result = new Uint8Array(totalLength);
    let pos = 0;
    for (const part of localParts) {
      result.set(part, pos);
      pos += part.length;
    }
    for (const part of centralParts) {
      result.set(part, pos);
      pos += part.length;
    }
    result.set(eocd, pos);

    return result;
  }
}

// Global data store instance
window.gapDataStore = new GapDataManager();
