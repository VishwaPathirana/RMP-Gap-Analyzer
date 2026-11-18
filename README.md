# RMP Gap Analyzer - 14 Plant Sections & Inspection System

A comprehensive, zero-dependency Gap Analysis and Plant Inspection System created directly from the handwritten blueprint diagram.

---

## 📐 Blueprint Translation

The system is built to mirror the specifications in the uploaded blueprint:

1. **14 Plant Sections:**
   1. `Yard A` (YRD-A) - Raw intake & primary yard
   2. `Yard B` (YRD-B) - Secondary yard & pallet staging
   3. `Yard C` (YRD-C) - Waste staging & container bay
   4. `Wet A` (WET-A) - Washing & primary wet process
   5. `Wet B` (WET-B) - Main liquid processing & CIP
   6. `Wet C` (WET-C) - Filtration & drainage separation
   7. `Milk` (MLK) - Milk reception & pasteurization
   8. `PDDC` (PDDC) - Product Development & Dairy Center / Drying unit
   9. `DC` (DC) - Distribution Center & sorting
   10. `FGC` (FGC) - Finished Goods Center cold store
   11. `CC` (CC) - Cold Chain / Central Control cooling
   12. `Stores` (STR) - Raw materials & chemical storage
   13. `Canteen` (CNT) - Staff dining & food safety
   14. `Outside Environment` (OUT) - Perimeter grounds & drainage

2. **Time Period Evaluations (as specified on paper):**
   - ⚡ **As per 2 week** (Bi-weekly evaluation / last 14 days)
   - 📅 **As per month** (Monthly evaluation / last 30 days)
   - 📆 **As per year** (Annual evaluation / 365 days)
   - 🌐 **All Records**

3. **Core Metrics:**
   - **Count of Gap (False Count):** Number of failed inspection points or reported defects.
   - **% Gap Rate:** $\frac{\text{Count of Gaps}}{\text{Total Checkpoints}} \times 100\%$
   - **% Facility Share:** $\frac{\text{Section Gaps}}{\text{Total Plant Gaps}} \times 100\%$

---

## 🚀 How to Run

### Method 1: Direct in Browser (Zero Installation)
Simply double-click `index.html` or open it in any browser:
```
d:\RMP\RMP Gap analyzer\index.html
```

### Method 2: Via Node.js Server
Open a terminal in `d:\RMP\RMP Gap analyzer` and run:
```bash
node server.js
```
Then visit: `http://localhost:3000`

---

## 🌟 Key Pages & Features

### 1. Section Gap Tracker (Page 1)
- Shows all **14 Sections** in an industrial quality table.
- Real-time tally of **Count of Gap (False findings)** and **% Gap Rate**.
- Color-coded risk status:
  - 🟢 **Good (< 5.0%):** Within tolerance
  - 🟡 **Warning (5.0% - 15.0%):** Corrective action needed
  - 🔴 **Critical (> 15.0%):** High priority intervention
- Click **"+ Add False"** on any section to instantly record a defect.

### 2. Bar Chart & Analytics (Page 2)
- Visual bar chart matching the paper drawing:
  - **Sections along the X-axis**
  - **% Gap Rate along the Y-axis**
- Switch between **% Gap Rate** and **Count of Gaps** with 1 click.
- Switch between **Standard Bar View** and **Pareto 80/20 View**.
- 5.0% maximum gap benchmark reference line.
- Hover over any bar to inspect section breakdown; click to open the fault history.
- **📷 Export PNG** button to save chart for reports.
- **🚨 Priority Defect Leaderboard** displaying the top 5 areas requiring attention.

### 3. Full Defect Registry (Page 3)
- Search and filter all logged gaps across the plant.
- Track resolution status (**Open**, **In Progress**, **Resolved**).
- Assign corrective actions and track responsible inspectors.

---

## 💾 Data Persistence & Export
- **LocalStorage Auto-Save:** Any changes or audits are automatically saved in the browser.
- **Clear All Data:** Click `🗑️ Clear All Data` anytime to wipe all recorded false/gap entries and start fresh across the 14 sections.
- **Excel Sheet Export (`.xlsx`):** Click `📗 Export Excel` to download a styled, multi-sheet Excel workbook (`Section Summary` with live Excel formulas + `Gap Findings Log`) for the active evaluation period.
