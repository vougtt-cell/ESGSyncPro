# Mock Data Testing Guide

## Step 1: Open Browser Console

1. Open `index.html` in browser
2. Press `F12` to open DevTools
3. Go to **Console** tab

## Step 2: Check Mock Data Loading

In console you should see:
```
✅ Mock data loaded: ENABLED
📊 Available mock data sections: (3) ['esgDocumentAnalysis', 'companyBenchmarks', 'userData']
```

If this is NOT visible - there's a problem with loading `mock-data.js`

## Step 3: Check Initialization

On page load, console should show:
```
🚀 Initializing ESG document analysis display
🔧 displayEsgDocumentAnalysis available: function
📊 Initial ESG_DOCUMENT_ANALYSIS: null
🔍 displayEsgDocumentAnalysis called with: null
📄 Showing placeholder (no data)
```

## Step 4: Testing Section 8 (Upload ESG Document)

### 4.1 Open Survey Form
1. Click **"Start Survey"** or **"Rozpocznij ankietę"** button
2. Fill required fields in first section
3. Scroll to **Section 8**

### 4.2 Check Placeholder
You should see:
```
┌─────────────────────────────┐
│         📄                  │
│  No document uploaded       │
│  Upload an ESG document... │
└─────────────────────────────┘
```

### 4.3 Upload Any File
1. Click on upload area
2. Select ANY file (PDF, DOCX, TXT)
3. Console should show:
```
🔧 USE_MOCK_DATA: true
🔧 MOCK_DATA available: true
🎭 Using MOCK DATA for document analysis
📦 Mock analysis data: {documentId: 'mock_doc_12345', ...}
```

### 4.4 Wait for Result (1.5 sec)
After upload you will see:
- ✅ Green notification: **"Document analyzed (DEMO)"**
- 📊 Analysis summary:
  - ESG Domains: E, S, G
  - ISO Standards: ISO_14001, ISO_26000, ISO_37001
  - Overall Coverage: 65%
- 🎯 3 ISO standard cards with coverage percentages

### 4.5 Expand Details
Click **"View Requirements Details"** on any ISO card - you will see:
- List of requirements with IDs
- Statuses: ✓ Compliant, ◐ Partial, ✗ Non-compliant, ? Not found
- Color indicators

## Step 5: Testing Section 7 (Company Benchmarks)

### 5.1 Find Section 7
Scroll to **"7. Porównanie z firmami"**

### 5.2 Enable Checkbox
Check **"Porównać z 5 firmami z Twojej niszy"**

### 5.3 Select Industry
In first section select industry **"Technology"** or another from list:
- Technology
- Manufacturing
- Finance
- Retail
- Healthcare

### 5.4 Console should show:
```
🏭 Loading benchmarks for industry: Technology
🔧 USE_MOCK_DATA: true
🎭 Using MOCK DATA for benchmarks
📦 Mock benchmarks: (3) [{...}, {...}, {...}]
✅ Loaded 3 mock benchmarks for industry "Technology"
```

### 5.5 Check Company List
Company checkboxes should appear:
- TechCorp Solutions
- Digital Innovations Ltd
- CloudTech Systems

## Troubleshooting

### ❌ Problem: "Mock data loaded" does NOT appear
**Solution:**
1. Check that `mock-data.js` is included in `index.html` (line 12)
2. Clear browser cache (Ctrl+Shift+Del)
3. Refresh page with cache clear (Ctrl+F5)

### ❌ Problem: Placeholder not showing
**Solution:**
1. Open DevTools → Elements
2. Find element `id="esg_doc_placeholder"`
3. Check its `display` style (should be `block`)

### ❌ Problem: Nothing happens after file upload
**Solution:**
1. Check console for JavaScript errors
2. Make sure `window.USE_MOCK_DATA = true`
3. Check that `window.MOCK_DATA` exists:
   ```javascript
   console.log(window.MOCK_DATA)
   ```

### ❌ Problem: Benchmarks not loading
**Solution:**
1. Check that correct industry is selected
2. Check console - should have loading logs
3. Check that "Porównać z firmami" checkbox is enabled

## Debug Commands

Paste in browser console:

```javascript
// Check mock data flag
console.log('Mock data enabled:', window.USE_MOCK_DATA);

// Check mock data availability
console.log('Mock data:', window.MOCK_DATA);

// Check current document analysis
console.log('Current analysis:', window.ESG_DOCUMENT_ANALYSIS);

// Check benchmarks
console.log('Benchmarks:', window.COMPANY_BENCHMARKS);

// Force show placeholder
window.displayEsgDocumentAnalysis(null);

// Force show mock data
window.displayEsgDocumentAnalysis(window.MOCK_DATA.esgDocumentAnalysis);
```

## Disabling Mock Data

To use real APIs instead of mocks:

1. Open `mock-data.js`
2. Change line 375:
   ```javascript
   window.USE_MOCK_DATA = false;
   ```
3. Refresh page

## Successful Result

If everything works correctly, you will see:
- ✅ Loading logs in console
- 📄 Placeholder when no document
- 🎭 Mock data when file is uploaded
- 📊 Detailed ISO compliance analysis
- 🏭 Company benchmarks for selected industry
- 📑 All data in PDF report

## ⚠️ Important Information About Data Storage

**ESG document analysis is NOT saved to database:**
- ✅ Results available in interface
- ✅ Results included in PDF report
- ❌ Data NOT saved to `esg_documents` table
- ❌ Data NOT linked to benchmarks

This is done for privacy and to avoid cluttering DB with test data.

If something doesn't work - check browser console for errors and follow instructions above!
