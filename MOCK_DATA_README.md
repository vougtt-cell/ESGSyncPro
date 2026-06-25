# Mock Data System - Usage Guide

## Overview

The mock data system allows demonstrating application functionality without database and AI API connection. This is useful for:
- UI development and testing
- Functionality demonstration to clients
- Working without server access

## ⚠️ Important: Document Analysis is NOT Saved to DB

**ESG document analysis (Section 8) is NOT saved to benchmark database.**

Reason:
- When calling API `/api/analyze-esg-document` we **DO NOT pass** `sessionId` and `benchmarkId`
- This means document is analyzed, but **NOT saved** to `esg_documents` table
- Analysis results are stored only in browser memory (`window.ESG_DOCUMENT_ANALYSIS`)
- Data **available for PDF**, but **NOT saved to DB**

This is done specifically to:
- ✅ Show results in PDF report
- ❌ NOT clutter benchmark database
- 🔒 Keep user documents private

## Enabling/Disabling Mock Data

### Enable Mock Data
In file `mock-data.js` set flag:
```javascript
window.USE_MOCK_DATA = true;
```

### Disable Mock Data (use real APIs)
```javascript
window.USE_MOCK_DATA = false;
```

## What is Mocked

### 1. Section 8 - ESG Document Analysis
**What happens when document is uploaded:**
- ✅ If `USE_MOCK_DATA = true`: Mock analysis results with ISO compliance data are shown
- ❌ If `USE_MOCK_DATA = false`: Request is sent to server `/api/analyze-esg-document`

**Mock data includes:**
- ESG domain classification (E, S, G)
- Compliance analysis for 3 ISO standards:
  - ISO 14001 - Environmental Management Systems (78% coverage)
  - ISO 26000 - Social Responsibility (65% coverage)
  - ISO 37001 - Anti-Bribery Management Systems (52% coverage)
- Detailed information for each standard requirement
- Statuses: compliant, partial, non_compliant, not_found

### 2. Section 7 - Company Comparison
**What happens when industry is selected:**
- ✅ If `USE_MOCK_DATA = true`: Mock benchmarks are loaded from `mock-data.js`
- ❌ If `USE_MOCK_DATA = false`: Request is sent to server `/api/company-benchmarks/:industry`

**Available industries with mock data:**
- Technology (3 companies)
- Manufacturing (3 companies)
- Finance (3 companies)
- Retail (2 companies)
- Healthcare (2 companies)

**Metrics for each company:**
- `scope1` - Scope 1 emissions (tons CO₂)
- `ren` - % renewable energy
- `paygap` - % pay gap

## Results Display

### If Document is NOT Uploaded
Placeholder is shown:
```
📄
No document uploaded
Upload an ESG document to see detailed ISO compliance analysis
```

### If Document is Uploaded
Shown:
1. **Analysis Summary:**
   - ESG Domains: E, S, G
   - ISO Standards: ISO_14001, ISO_26000, ISO_37001
   - Overall Coverage: 65%

2. **Details for Each Standard:**
   - Standard name
   - Coverage percentage (color indicator)
   - Total requirements count
   - Covered requirements count
   - "View Requirements Details" button to view details

3. **Standard Requirements** (when expanded):
   - Requirement ID
   - Requirement name
   - Status (✓ Compliant / ◐ Partial / ✗ Non-compliant / ? Not found)

## Editing Mock Data

### Change Document Analysis Data
Open `mock-data.js` and modify `esgDocumentAnalysis` object:

```javascript
const MOCK_DATA = {
  esgDocumentAnalysis: {
    esgClassification: {
      domains: ['E', 'S'], // Change domains
      confidence: 'high',
      explanation: 'Your description'
    },
    isoCompliance: {
      // Change ISO compliance data
    }
  }
}
```

### Add New Company to Benchmarks
```javascript
companyBenchmarks: {
  'Technology': [
    // Existing companies...
    {
      companyName: 'New Company',
      industry: 'Technology',
      scope1: 200.5,
      ren: 50.0,
      paygap: 10.0
    }
  ]
}
```

### Add New Industry
```javascript
companyBenchmarks: {
  // Existing industries...
  'NewIndustry': [
    {
      companyName: 'Company 1',
      industry: 'NewIndustry',
      scope1: 150.0,
      ren: 40.0,
      paygap: 12.0
    }
  ]
}
```

## Implementation Details

### Server Delay Simulation
Mock data includes artificial delays for realism:
- Document analysis: 1.5 seconds
- Benchmark loading: 0.8 seconds

### Mock Mode Indication
When document is uploaded in mock mode, notification includes "(DEMO)" label:
```
Document analyzed (DEMO). Identified ESG domains: E, S, G
```

### Real API Compatibility
Mock data structure is fully compatible with real API. When switching from `USE_MOCK_DATA = true` to `false`, application will work without code changes.

## Debugging

### Check if Mock Data is Used
Open browser console:
```javascript
console.log('Mock data enabled:', window.USE_MOCK_DATA);
console.log('Mock data available:', window.MOCK_DATA);
```

### View Loaded Data
```javascript
// Document analysis
console.log('ESG Analysis:', window.ESG_DOCUMENT_ANALYSIS);

// Company benchmarks
console.log('Benchmarks:', window.COMPANY_BENCHMARKS);
```

## Troubleshooting

### Problem: Placeholder not showing
**Solution:** Make sure `displayEsgDocumentAnalysis(null)` is called on page load

### Problem: Mock data not loading
**Solution:**
1. Check that `mock-data.js` is included in `index.html`
2. Check that `window.USE_MOCK_DATA = true`
3. Open browser console and check for errors

### Problem: Analysis results not displaying
**Solution:**
1. Check that `displayEsgDocumentAnalysis()` function is defined
2. Make sure HTML containers exist:
   - `esg_doc_analysis_container`
   - `esg_doc_placeholder`
   - `iso_compliance_details`

## System Files

```
esgsyncprolanding/
├── mock-data.js                 # Mock data and configuration
├── index.html                   # Main file with integration
└── MOCK_DATA_README.md          # This guide
```

## Quick Start

1. Open `mock-data.js`
2. Make sure `window.USE_MOCK_DATA = true`
3. Open `index.html` in browser
4. Go to section 8 (Upload ESG document)
5. Upload any file (PDF, DOCX, TXT)
6. After 1.5 seconds mock analysis results will appear
7. For section 7 select "Technology" industry and enable comparison checkbox

## Additional Information

For questions and suggestions on improving mock data system, contact development team.
