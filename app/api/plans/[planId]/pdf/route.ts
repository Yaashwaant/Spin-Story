import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

// Helper function to create clickable item links in text
function createItemLinks(text: string, wardrobeItems: WardrobeItem[]): string {
  let modifiedText = text
  
  wardrobeItems.forEach(item => {
    if (item.name && item.image) {
      // Create a regex to match the item name (case insensitive)
      const escapedName = item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b${escapedName}\\b`, 'gi')
      
      // Replace matches with clickable links
      modifiedText = modifiedText.replace(regex, 
        `<a href="${item.image}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 500;">${item.name}</a>`
      )
    }
  })
  
  return modifiedText
}

// Function to parse markdown table to HTML while preserving links
function parseMarkdownTable(markdown: string): string {
  // Check if the content already contains HTML table tags
  if (markdown.includes('<table') && markdown.includes('</table>')) {
    // Content already has HTML tables, just return it
    return markdown
  }
  
  // Split the markdown into lines
  const lines = markdown.trim().split('\n')
  
  // Look for table rows (lines with | separators)
  const tableRows = lines.filter(line => line.includes('|') && line.trim().length > 0)
  
  if (tableRows.length === 0) {
    // No table found, return the original content with basic formatting and preserve links
    return markdown
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  }
  
  // Find the header row (first row with |)
  const headerRow = tableRows[0]
  const headers = headerRow.split('|').map(h => h.trim()).filter(h => h)
  
  // Get data rows (all rows except the first one)
  const dataRows = tableRows.slice(1)
  
  // Build HTML table with professional styling
  let html = '<table class="markdown-table">\n'
  
  // Add headers
  html += '  <thead>\n    <tr>\n'
  headers.forEach(header => {
    html += `      <th>${header}</th>\n`
  })
  html += '    </tr>\n  </thead>\n'
  
  // Add data rows
  html += '  <tbody>\n'
  dataRows.forEach(row => {
    const cells = row.split('|').map(c => c.trim()).filter(c => c)
    if (cells.length > 0) {
      html += '    <tr>\n'
      cells.forEach(cell => {
        // Preserve HTML links in cells
        html += `      <td>${cell}</td>\n`
      })
      html += '    </tr>\n'
    }
  })
  html += '  </tbody>\n</table>'
  
  return html
}

interface RouteParams {
  params: {
    planId: string
  }
}

interface OutfitPlan {
  id: string
  planId: string
  customerId: string
  planType: string
  triggeredBy: string
  conversationNotes: string
  contextTitle?: string
  preview: string
  outfits: Array<{
    name: string
    items: Array<{
      name: string
      type: string
      color: string
      styles: string[]
    }>
    colorCoordination: string
  }>
  styleRecommendations: string
  practicalConsiderations: string
  mixAndMatchOptions: string[]
  budgetConsiderations: string
  createdAt: string
  updatedAt: string
}

interface WardrobeItem {
  id: string
  name: string
  image: string
  type: string
  color: string
  season: string
  styles: string[]
  customerId: string
}

function generatePlanHTML(plan: OutfitPlan, customerName?: string, wardrobeItems: WardrobeItem[] = []): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Outfit Plan - ${plan.planType}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
          padding: 20px;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          font-weight: 300;
        }
        
        .header .subtitle {
          font-size: 1.2em;
          opacity: 0.9;
        }
        
        .header .date {
          font-size: 0.9em;
          opacity: 0.8;
          margin-top: 10px;
        }
        
        .content {
          padding: 30px;
        }
        
        .section {
          margin-bottom: 35px;
          padding-bottom: 25px;
          border-bottom: 1px solid #eee;
        }
        
        .section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        
        .section h2 {
          color: #667eea;
          font-size: 1.8em;
          margin-bottom: 20px;
          font-weight: 500;
          position: relative;
          padding-left: 25px;
        }
        
        .section h2::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 15px;
          height: 15px;
          background: #667eea;
          border-radius: 50%;
        }
        
        .outfit {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          border-left: 4px solid #667eea;
        }
        
        .outfit h3 {
          color: #333;
          font-size: 1.4em;
          margin-bottom: 15px;
          font-weight: 500;
        }
        
        .outfit-items {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .item {
          background: white;
          padding: 12px 16px;
          border-radius: 6px;
          border: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .item-name {
          font-weight: 500;
          color: #495057;
        }
        
        .item-details {
          font-size: 0.9em;
          color: #6c757d;
          text-align: right;
        }
        
        .color-coordination {
          background: #e3f2fd;
          padding: 12px 16px;
          border-radius: 6px;
          border-left: 3px solid #2196f3;
          font-style: italic;
          color: #1565c0;
        }
        
        .recommendations {
          background: #f3e5f5;
          padding: 15px 20px;
          border-radius: 6px;
          border-left: 3px solid #9c27b0;
        }
        
        .considerations {
          background: #e8f5e8;
          padding: 15px 20px;
          border-radius: 6px;
          border-left: 3px solid #4caf50;
        }
        
        .mix-match {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        
        .mix-match-item {
          background: #fff3e0;
          padding: 12px 16px;
          border-radius: 6px;
          border-left: 3px solid #ff9800;
          font-size: 0.95em;
        }
        
        .budget {
          background: #e1f5fe;
          padding: 15px 20px;
          border-radius: 6px;
          border-left: 3px solid #03a9f4;
          font-weight: 500;
        }
        
        .plan-content {
          font-size: 1.1em;
          line-height: 1.8;
          color: #2c3e50;
        }
        
        .plan-content strong {
          color: #667eea;
          font-weight: 600;
        }
        
        .plan-content hr {
          margin: 25px 0;
          border: none;
          border-top: 2px solid #e9ecef;
        }
        
        /* Schedule Table Styles */
        .schedule-table {
          margin: 20px 0;
          overflow-x: auto;
        }
        
        .schedule-table table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .schedule-table th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.95em;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .schedule-table td {
          padding: 12px;
          border-bottom: 1px solid #e9ecef;
          vertical-align: top;
        }
        
        .schedule-table tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        .schedule-table tr:hover {
          background-color: #e3f2fd;
          transition: background-color 0.2s ease;
        }
        
        .day-cell {
          font-weight: 600;
          color: #667eea;
          background-color: #f3e5f5;
          border-left: 4px solid #667eea;
        }
        
        .outfit-name {
          font-weight: 500;
          color: #333;
          font-size: 1.1em;
        }
        
        .items-cell {
          color: #666;
          font-size: 0.9em;
          line-height: 1.4;
        }
        
        .colors-cell {
          color: #666;
          font-size: 0.9em;
        }
        
        .notes-cell {
          color: #555;
          font-size: 0.9em;
          font-style: italic;
        }
        
        /* Detailed Outfit Breakdown Styles */
        .outfit-detail {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .outfit-detail h3 {
          color: #667eea;
          font-size: 1.4em;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e9ecef;
        }
        
        .outfit-items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .item-card {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 15px;
          text-align: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .item-type {
          background: #667eea;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .item-name {
          font-weight: 600;
          color: #333;
          margin: 10px 0;
          font-size: 1.1em;
        }
        
        .item-styles {
          color: #666;
          font-size: 0.9em;
          font-style: italic;
        }
        
        .color-coordination-detail {
          background: #e3f2fd;
          padding: 12px 16px;
          border-radius: 6px;
          border-left: 4px solid #2196f3;
          margin-top: 15px;
        }
        
        /* Table-only content styles */
        .table-only-content {
          padding: 20px;
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
        }
        
        .table-only-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .table-only-content th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.95em;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .table-only-content td {
          padding: 12px;
          border-bottom: 1px solid #e9ecef;
          vertical-align: top;
        }
        
        .table-only-content tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        .table-only-content tr:hover {
          background-color: #e3f2fd;
        }
        
        /* Excel-like Professional Table Styles */
        .markdown-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
          border: 2px solid #2c3e50;
          font-family: 'Arial', sans-serif;
        }
        
        .markdown-table th {
          background: #2c3e50;
          color: white;
          padding: 12px 15px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9em;
          border: 1px solid #34495e;
          text-transform: none;
          letter-spacing: normal;
        }
        
        .markdown-table td {
          padding: 10px 15px;
          border: 1px solid #bdc3c7;
          vertical-align: top;
          font-size: 0.85em;
          line-height: 1.3;
          color: #2c3e50;
        }
        
        .markdown-table tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        .markdown-table tr:nth-child(odd) {
          background-color: #ffffff;
        }
        
        .markdown-table tr:hover {
          background-color: #e8f4f8;
        }
        
        /* Professional Excel-like Table Styling */
        .markdown-table {
          border: 3px solid #1f4e79 !important;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          margin: 30px 0;
          background: white;
          font-family: 'Segoe UI', 'Arial', 'Helvetica', sans-serif;
          width: 100%;
          max-width: 100%;
        }
        
        .markdown-table th {
          background: linear-gradient(135deg, #1f4e79 0%, #2c5282 100%);
          color: white;
          padding: 18px 20px;
          text-align: center;
          font-weight: 700;
          font-size: 1.05em;
          border: 1px solid #1a3a5c !important;
          border-bottom: 3px solid #ffd700 !important;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          white-space: nowrap;
        }
        
        .markdown-table th:first-child {
          border-top-left-radius: 10px;
          text-align: left;
          min-width: 80px;
        }
        
        .markdown-table th:last-child {
          border-top-right-radius: 10px;
          text-align: left;
        }
        
        .markdown-table td {
          padding: 16px 20px;
          border: 1px solid #d0d7e0 !important;
          border-top: none !important;
          vertical-align: top;
          font-size: 0.95em;
          line-height: 1.6;
          color: #2c3e50;
          background: white;
          transition: all 0.2s ease;
          word-wrap: break-word;
          word-break: break-word;
        }
        
        .markdown-table tr:nth-child(even) td {
          background-color: #f8fafc;
        }
        
        .markdown-table tr:nth-child(odd) td {
          background-color: #ffffff;
        }
        
        .markdown-table tr:hover td {
          background-color: #e3f2fd;
          transition: all 0.2s ease;
        }
        
        /* Excel-style row borders and grid lines */
        .markdown-table tr {
          border-bottom: 1px solid #e2e8f0;
        }
        
        .markdown-table tr:last-child {
          border-bottom: none;
        }
        
        .markdown-table tr:last-child td:first-child {
          border-bottom-left-radius: 10px;
        }
        
        .markdown-table tr:last-child td:last-child {
          border-bottom-right-radius: 10px;
        }
        
        /* Professional cell styling - Excel-like column formatting */
        .markdown-table td:first-child {
          font-weight: 700;
          color: #1f4e79;
          background-color: #f1f5f9;
          border-right: 2px solid #cbd5e0;
          text-align: left;
          min-width: 80px;
          white-space: nowrap;
          font-family: 'Segoe UI', 'Arial', sans-serif;
          font-size: 1em;
        }
        
        .markdown-table td:nth-child(2) {
          font-weight: 600;
          color: #2d3748;
          background-color: #ffffff;
          line-height: 1.5;
          font-family: 'Segoe UI', 'Arial', sans-serif;
        }
        
        .markdown-table td:last-child {
          color: #4a5568;
          font-style: italic;
          background-color: #f7fafc;
          font-weight: 400;
          line-height: 1.5;
          font-family: 'Segoe UI', 'Arial', sans-serif;
        }
        
        /* Excel-style alternating row colors with better contrast */
        .markdown-table tbody tr:nth-child(4n+1) td {
          background-color: #ffffff;
        }
        
        .markdown-table tbody tr:nth-child(4n+2) td {
          background-color: #f8fafc;
        }
        
        .markdown-table tbody tr:nth-child(4n+3) td {
          background-color: #ffffff;
        }
        
        .markdown-table tbody tr:nth-child(4n+4) td {
          background-color: #f1f5f9;
        }
        
        /* Excel-like grid lines and borders */
        .markdown-table td:not(:last-child) {
          border-right: 1px solid #e2e8f0;
        }
        
        .markdown-table th:not(:last-child) {
          border-right: 1px solid #2c5282;
        }
        
        /* Professional Excel-style Table with Grid Lines */
        .markdown-table {
          border-collapse: separate;
          border-spacing: 0;
          border: 3px solid #2c3e50;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          font-family: 'Arial', sans-serif;
          width: 100%;
          margin: 25px 0;
        }
        
        /* Excel-style column-specific styling with professional colors */
        .markdown-table th:first-child {
          background: linear-gradient(135deg, #1f4e79 0%, #2c5282 100%);
          font-weight: 700;
          width: 20%;
          text-align: center;
          border-right: 2px solid #1a3a5c;
        }
        
        .markdown-table th:nth-child(2) {
          background: linear-gradient(135deg, #2c5282 0%, #3182ce 100%);
          width: 45%;
          text-align: left;
          border-right: 2px solid #1a3a5c;
        }
        
        .markdown-table th:last-child {
          background: linear-gradient(135deg, #1f4e79 0%, #2c5282 100%);
          width: 35%;
          text-align: left;
        }
        
        .markdown-table td:first-child {
          font-weight: 700;
          color: #1f4e79;
          background-color: #f8fafc;
          text-align: center;
          border-left: none;
          border-right: 2px solid #e2e8f0;
          font-size: 0.95em;
          text-transform: capitalize;
          padding: 12px 15px;
        }
        
        .markdown-table td:nth-child(2) {
          font-weight: 500;
          color: #2d3748;
          text-align: left;
          padding: 12px 15px;
          border-right: 2px solid #e2e8f0;
        }
        
        .markdown-table td:last-child {
          font-style: normal;
          color: #4a5568;
          text-align: left;
          padding: 12px 15px;
          background-color: #ffffff;
        }
        
        /* Excel-style grid lines and borders */
        .markdown-table th,
        .markdown-table td {
          border-bottom: 1px solid #d1d5db;
        }
        
        .markdown-table tr:last-child td {
          border-bottom: none;
        }
        
        /* Excel-style row striping */
        .markdown-table tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .markdown-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        
        /* Excel-style hover effects */
        .markdown-table tbody tr:hover {
          background-color: #e0f2fe !important;
          transition: background-color 0.15s ease;
        }
        
        /* Excel-style cell borders on hover */
        .markdown-table tbody tr:hover td {
          border-color: #3b82f6;
        }
        
        /* Excel-style header borders */
        .markdown-table thead th {
          border-bottom: 3px solid #1a3a5c !important;
          border-right: 1px solid #4a90e2;
        }
        
        .markdown-table thead th:last-child {
          border-right: none;
        }
        
        /* Print optimization for Excel-style tables */
        @media print {
          .markdown-table {
            box-shadow: none !important;
            border: 2px solid #000 !important;
            border-collapse: collapse !important;
            border-spacing: 0 !important;
            page-break-inside: avoid;
            margin: 20px 0 !important;
            font-family: 'Arial', sans-serif !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .markdown-table th {
            background: #1f4e79 !important;
            background-color: #1f4e79 !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-weight: 700 !important;
            font-size: 0.9em !important;
            padding: 12px 15px !important;
            border: 1px solid #000 !important;
            text-align: center !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
          }
          
          .markdown-table td {
            background: white !important;
            background-color: white !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 0.85em !important;
            padding: 10px 12px !important;
            border: 1px solid #ccc !important;
            vertical-align: top !important;
            line-height: 1.4 !important;
          }
          
          .markdown-table td:first-child {
            background-color: #f5f5f5 !important;
            background: #f5f5f5 !important;
            font-weight: 600 !important;
            color: #1f4e79 !important;
            border-right: 2px solid #666 !important;
            text-align: left !important;
            white-space: nowrap !important;
          }
          
          .markdown-table td:nth-child(2) {
            background-color: white !important;
            background: white !important;
            font-weight: 500 !important;
            color: #000 !important;
          }
          
          .markdown-table td:last-child {
            background-color: #fafafa !important;
            background: #fafafa !important;
            color: #333 !important;
            font-style: italic !important;
          }
          
          /* Excel-style alternating rows for print */
          .markdown-table tbody tr:nth-child(even) td {
            background-color: #f9f9f9 !important;
            background: #f9f9f9 !important;
          }
          
          .markdown-table tbody tr:nth-child(odd) td:not(:first-child):not(:last-child) {
            background-color: white !important;
            background: white !important;
          }
          
          .markdown-table tr:hover {
            background-color: transparent !important;
          }
          
          /* Remove shadows and effects for print */
          .markdown-table th:first-child,
          .markdown-table th:last-child,
          .markdown-table tr:last-child td:first-child,
          .markdown-table tr:last-child td:last-child {
            border-radius: 0 !important;
          }
          
          .markdown-table td:not(:last-child) {
            border-right: 1px solid #ccc !important;
          }
          
          .markdown-table th:not(:last-child) {
            border-right: 1px solid #000 !important;
          }
        }
        
        .markdown-table th,
        .markdown-table td {
          border-width: 1px !important;
          border-style: solid !important;
        }
        
        .markdown-table th {
          border-top: 2px solid #1f4e79 !important;
          border-bottom: 2px solid #1f4e79 !important;
        }
        
        .markdown-table th:first-child {
          border-left: 2px solid #1f4e79 !important;
          border-top-left-radius: 6px;
        }
        
        .markdown-table th:last-child {
          border-right: 2px solid #1f4e79 !important;
          border-top-right-radius: 6px;
        }
        
        .markdown-table tr:last-child td:first-child {
          border-bottom-left-radius: 6px;
        }
        
        .markdown-table tr:last-child td:last-child {
          border-bottom-right-radius: 6px;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .container {
            box-shadow: none;
            border: 1px solid #ddd;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>The Spin Story</h1>
        </div>
        
        <div class="content">
          <!-- Table Content Only -->
          <div class="table-only-content">
            ${parseMarkdownTable(createItemLinks(plan.preview, wardrobeItems))}
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { planId } = await params

  if (!planId) {
    return NextResponse.json({ error: "Missing plan id" }, { status: 400 })
  }

  try {
    // Fetch the plan data from Firestore
    const planDoc = await adminDb.collection('outfitPlans').doc(planId).get()
    
    if (!planDoc.exists) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    const planData = planDoc.data() as OutfitPlan
    
    // Fetch customer information if available
    let customerName: string | undefined
    let wardrobeItems: WardrobeItem[] = []
    
    if (planData.customerId) {
      const customerDoc = await adminDb.collection('customers').doc(planData.customerId).get()
      if (customerDoc.exists) {
        const customerData = customerDoc.data()
        customerName = customerData?.name || customerData?.customerName
      }
      
      // Fetch wardrobe items for the customer
      try {
        const wardrobeSnapshot = await adminDb
          .collection('wardrobe')
          .where('customerId', '==', planData.customerId)
          .get()
        
        wardrobeItems = wardrobeSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || '',
            image: data.image || '',
            type: data.type || '',
            color: data.color || '',
            season: data.season || '',
            styles: data.styles || [],
            customerId: data.customerId || '',
          }
        })
        console.log(`Found ${wardrobeItems.length} wardrobe items for PDF generation`)
      } catch (wardrobeError) {
        console.error("Error fetching wardrobe items for PDF:", wardrobeError)
        // Continue without wardrobe data if fetch fails
      }
    }

    // Generate HTML content
    const htmlContent = generatePlanHTML(planData, customerName, wardrobeItems)

    // Send HTML to Gotenberg for PDF generation
    const form = new FormData()
    form.append('files', new Blob([htmlContent], { type: 'text/html' }), 'index.html')
    form.append('paperWidth', '210')   // A4 width in mm
    form.append('paperHeight', '297')  // A4 height in mm
    form.append('marginTop', '20')
    form.append('marginRight', '20')
    form.append('marginBottom', '20')
    form.append('marginLeft', '20')
    form.append('printBackground', 'true')
    form.append('preferCssPageSize', 'true')

    const gotenbergRes = await fetch('https://demo.gotenberg.dev/forms/chromium/convert/html', {
      method: 'POST',
      body: form
    })

    if (!gotenbergRes.ok) {
      throw new Error(`Gotenberg error: ${gotenbergRes.status} ${gotenbergRes.statusText}`)
    }

    const pdfBuffer = await gotenbergRes.arrayBuffer()

    // Return PDF as response
    const buffer = Buffer.from(pdfBuffer)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="outfit-plan-${planData.planType}-${planId}.pdf"`,
        'Content-Length': buffer.length.toString()
      }
    })
    
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ 
      error: "Failed to generate PDF", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

