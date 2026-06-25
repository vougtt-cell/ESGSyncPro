const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const getStyles = () => `
    @page {
        size: A4;
        margin: 0;
    }
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    body {
        font-family: 'Arial', 'Helvetica', sans-serif;
        line-height: 1.6;
        color: #1e293b;
        background: #ffffff;
        margin: 0;
        padding: 0;
    }
    .page {
        width: 794px;
        height: 1123px;
        max-height: 1123px;
        padding: 30px 25px 20px 25px;
        margin: 0 auto;
        page-break-after: always;
        page-break-inside: avoid;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
    }
    .page:last-child {
        page-break-after: auto;
    }
    h1 {
        color: #A3CC4B;
        font-size: 32px;
        margin-bottom: 24px;
        text-align: center;
        border-bottom: 3px solid #A3CC4B;
        padding-bottom: 16px;
    }
    h2 {
        color: #1e293b;
        font-size: 24px;
        margin-top: 24px;
        margin-bottom: 16px;
        border-left: 4px solid #A3CC4B;
        padding-left: 16px;
    }
    h3 {
        color: #475569;
        font-size: 20px;
        margin-top: 20px;
        margin-bottom: 12px;
    }
    .section {
        margin-bottom: 20px;
    }
    ul, ol {
        margin-left: 20px;
        margin-bottom: 12px;
    }
    li {
        margin-bottom: 6px;
    }
    .highlight-box {
        background: #f0fdf4;
        border-left: 4px solid #A3CC4B;
        padding: 15px;
        margin: 15px 0;
        border-radius: 5px;
    }
    .info-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 12px;
        margin: 12px 0;
        border-radius: 5px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
    }
    th, td {
        border: 1px solid #e2e8f0;
        padding: 10px;
        text-align: left;
    }
    th {
        background: #A3CC4B;
        color: white;
        font-weight: bold;
    }
    tr:nth-child(even) {
        background: #f8fafc;
    }
    .footer {
        position: absolute;
        bottom: 5px;
        left: 0;
        right: 0;
        text-align: center;
        color: #A3CC4B;
        font-size: 11px;
        padding: 0;
        margin: 0;
    }
    .page-number {
        position: absolute;
        bottom: 5px;
        right: 35px;
        color: #64748b;
        font-size: 11px;
        margin: 0;
    }
`;

const getEnglishHTML = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>How to Read Your ESG Report</title>
    <style>${getStyles()}</style>
</head>
<body>
    <!-- Cover Page -->
    <div class="page" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 10px 20px 0px 20px; min-height: 1123px !important; max-height: 1123px !important; overflow: hidden !important; box-sizing: border-box !important; position: relative; page-break-after: always !important; page-break-inside: avoid !important;">
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%;">
            <h1 style="font-size: 28px; border: none; margin-bottom: 8px; line-height: 1.2; margin-top: 0;">📖</h1>
            <h1 style="font-size: 24px; border: none; margin-bottom: 15px; line-height: 1.2;">How to Read Your ESG Report</h1>
            <div style="font-size: 13px; color: #64748b; max-width: 500px; margin-top: 12px;">
                <p style="margin-bottom: 8px; line-height: 1.4;">This guide will help you understand and interpret your ESG Assessment Report.</p>
            </div>
        </div>
        <div class="footer" style="position: absolute; bottom: 0px; left: 0; right: 0; text-align: center; padding: 0; height: auto;">
            <p style="font-size: 9px; margin: 0;">ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
    </div>

    <!-- Page 1 -->
    <div class="page">
        <h1 style="font-size: 30px; margin-bottom: 22px;">📋 How to Read Your ESG Report</h1>
        
        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">📊 Report Structure Overview</h2>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">Your ESG Assessment Report contains several key sections that provide a comprehensive view of your organization's sustainability performance:</p>
            <ol style="font-size: 15px; margin-left: 24px; margin-bottom: 14px;">
                <li style="margin-bottom: 7px;"><strong>Cover Page</strong> - Overall ESG score and interpretation</li>
                <li style="margin-bottom: 7px;"><strong>ESG Quick Assessment</strong> - Summary of your company information and assessment</li>
                <li style="margin-bottom: 7px;"><strong>Detailed ESG Scores</strong> - Breakdown by Environmental (E), Social (S), Governance (G), and Supply Chain</li>
                <li style="margin-bottom: 7px;"><strong>Executive Summary</strong> - Key findings and interpretation of your results</li>
                <li style="margin-bottom: 7px;"><strong>Pillar Analysis</strong> - Detailed analysis of E, S, and G pillars</li>
                <li style="margin-bottom: 7px;"><strong>Legal Compliance Check</strong> - Verification against regulatory requirements</li>
                <li style="margin-bottom: 7px;"><strong>Materiality Assessment</strong> - Importance of different ESG factors for your industry</li>
                <li style="margin-bottom: 7px;"><strong>ESG Analysis & Recommendations</strong> - Actionable insights and next steps</li>
                <li style="margin-bottom: 7px;"><strong>Document Verification</strong> - Analysis of uploaded ESG documents (if provided)</li>
                <li style="margin-bottom: 7px;"><strong>Key ESG Indicators</strong> - Extracted metrics from your documents (if provided)</li>
            </ol>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">🎯 Understanding Your Overall Score</h2>
            <div class="highlight-box" style="padding: 18px; margin: 18px 0;">
                <p style="font-size: 15px; margin: 0; line-height: 1.5;"><strong>Your overall ESG score</strong> is calculated based on your answers to strategic readiness questions across four main areas: Environmental (E), Social (S), Governance (G), and Supply Chain. The maximum possible score is 85 points, which is then converted to a percentage.</p>
            </div>
            <h3 style="font-size: 19px; margin-top: 18px; margin-bottom: 12px;">Score Interpretation:</h3>
            <table style="font-size: 14px; margin: 18px 0;">
                <tr>
                    <th style="padding: 12px;">Score Range</th>
                    <th style="padding: 12px;">Level</th>
                    <th style="padding: 12px;">Meaning</th>
                </tr>
                <tr>
                    <td style="padding: 12px;">0-39%</td>
                    <td style="padding: 12px;">🔴 Beginner</td>
                    <td style="padding: 12px;">Low sustainability maturity. Urgent action needed in environmental, social, and governance areas.</td>
                </tr>
                <tr>
                    <td style="padding: 12px;">40-69%</td>
                    <td style="padding: 12px;">🟠 Intermediate</td>
                    <td style="padding: 12px;">Medium maturity. You have foundations but need improvement in standardization and policy completion.</td>
                </tr>
                <tr>
                    <td style="padding: 12px;">70-100%</td>
                    <td style="padding: 12px;">🟢 Advanced</td>
                    <td style="padding: 12px;">High maturity. Well-developed ESG processes. Consider expanding reporting scope and external verification.</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
        <div class="page-number">Page 2</div>
    </div>

    <!-- Page 2 -->
    <div class="page">
        <h1 style="font-size: 30px; margin-bottom: 22px;">📋 How to Read Your ESG Report (continued)</h1>
        
        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">📈 Understanding Pillar Scores</h2>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">Your report breaks down performance into four main areas:</p>
            <ul style="font-size: 15px; margin-left: 24px; margin-bottom: 14px;">
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>🌿 Environmental (E)</strong> - Maximum 30 points. Covers energy monitoring, CO₂ emissions tracking, scope reporting (1, 2, 3), renewable energy usage, environmental targets, and environmental policies.</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>👥 Social (S)</strong> - Maximum 25 points. Includes diversity, equity & inclusion (DEI), gender representation in management, health & safety incident tracking, whistleblower protection, and ESG training programs.</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>🏛️ Governance (G)</strong> - Maximum 20 points. Encompasses risk management, executive compensation disclosure, ownership structure transparency, and quality control/audit processes.</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>📦 Supply Chain</strong> - Maximum 15 points. Evaluates supplier coverage assessment, data collection processes, and assessment frequency for supply chain sustainability.</li>
            </ul>
            <div class="info-box" style="padding: 16px; margin: 16px 0;">
                <p style="font-size: 15px; margin: 0; line-height: 1.5;"><strong>💡 Tip:</strong> Each area is scored independently. A low score in one area doesn't necessarily mean poor overall performance, but it indicates where improvement is needed. The total score (E + S + G + Supply Chain) is calculated out of 85 points maximum.</p>
            </div>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">✅ Legal Compliance Check</h2>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">This section verifies your alignment with key regulatory frameworks:</p>
            <ul style="font-size: 15px; margin-left: 24px; margin-bottom: 14px;">
                <li style="margin-bottom: 7px;"><strong>CSRD/ESRS</strong> - European Sustainability Reporting Standards compliance</li>
                <li style="margin-bottom: 7px;"><strong>Double Materiality</strong> - Assessment of both financial and impact materiality</li>
                <li style="margin-bottom: 7px;"><strong>EU Taxonomy</strong> - Alignment with EU Taxonomy for sustainable activities</li>
                <li style="margin-bottom: 7px;"><strong>DNSH & Safeguards</strong> - Do No Significant Harm principle and minimum safeguards</li>
                <li style="margin-bottom: 7px;"><strong>SFDR</strong> - Sustainable Finance Disclosure Regulation obligations</li>
                <li style="margin-bottom: 7px;"><strong>Assurance</strong> - Independent verification status</li>
            </ul>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">Each item shows your compliance status: ✅ Compliant, ⚠️ Partial, or ❌ Non-compliant.</p>
        </div>

        <div class="footer">
            <p>ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
        <div class="page-number">Page 3</div>
    </div>

    <!-- Page 3 -->
    <div class="page">
        <h1 style="font-size: 30px; margin-bottom: 22px;">📋 How to Read Your ESG Report (continued)</h1>
        
        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">🎯 Materiality Assessment</h2>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">The materiality section shows the relative importance of different ESG factors for your specific industry. This helps you prioritize where to focus your efforts.</p>
            <div class="highlight-box" style="padding: 18px; margin: 18px 0;">
                <p style="font-size: 15px; margin: 0; line-height: 1.5;"><strong>Understanding Importance Values:</strong> Higher values indicate that a particular ESG factor is more critical for your industry. Focus on improving areas with high importance values first.</p>
            </div>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">💡 Recommendations Section</h2>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">This is one of the most actionable parts of your report. It provides:</p>
            <ul style="font-size: 15px; margin-left: 24px; margin-bottom: 14px;">
                <li style="margin-bottom: 7px;"><strong>Why</strong> - Explanation of why improvements are needed</li>
                <li style="margin-bottom: 7px;"><strong>How</strong> - Specific steps you can take to improve</li>
                <li style="margin-bottom: 7px;"><strong>Priority Actions</strong> - What to focus on first</li>
            </ul>
            <div class="info-box" style="padding: 16px; margin: 16px 0;">
                <p style="font-size: 15px; margin: 0; line-height: 1.5;"><strong>📌 Action Item:</strong> Review recommendations regularly and track your progress. Consider assigning responsibility for each recommendation to specific team members.</p>
            </div>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">📄 Document Verification & Key Indicators</h2>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">If you uploaded ESG documents, the report includes:</p>
            <ul style="font-size: 15px; margin-left: 24px; margin-bottom: 14px;">
                <li style="margin-bottom: 7px;"><strong>Document Analysis</strong> - Verification of document completeness and alignment with standards</li>
                <li style="margin-bottom: 7px;"><strong>Extracted Metrics</strong> - Key ESG indicators automatically extracted from your documents</li>
                <li style="margin-bottom: 7px;"><strong>Recommendations</strong> - Specific suggestions based on your document content</li>
            </ul>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">🚀 Next Steps</h2>
            <ol style="font-size: 15px; margin-left: 24px; margin-bottom: 14px;">
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>Review your overall score</strong> - Understand where you stand in terms of ESG maturity</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>Identify priority areas</strong> - Focus on pillars with lower scores or higher materiality</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>Review recommendations</strong> - Create an action plan based on the provided recommendations</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>Set targets</strong> - Establish specific, measurable goals for improvement</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>Monitor progress</strong> - Regularly reassess your ESG performance</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>Consider external support</strong> - If needed, seek professional assistance for complex areas</li>
            </ol>
        </div>

        <div class="footer">
            <p>ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
        <div class="page-number">Page 4</div>
    </div>

    <!-- Quick Reference Page -->
    <div class="page">
        <h1 style="font-size: 30px; margin-bottom: 22px;">📌 Quick Reference Guide</h1>
        
        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 22px; margin-top: 22px; margin-bottom: 12px;">🔍 Where to Find Information</h2>
            
            <table style="font-size: 14px; margin: 17px 0;">
                <tr>
                    <th style="width: 40%; padding: 11px;">What You Need</th>
                    <th style="padding: 11px;">Where to Look</th>
                </tr>
                <tr>
                    <td style="padding: 11px;">Overall ESG Score</td>
                    <td style="padding: 11px;">Cover Page</td>
                </tr>
                <tr>
                    <td style="padding: 11px;">Detailed Pillar Scores</td>
                    <td style="padding: 11px;">Detailed ESG Scores section</td>
                </tr>
                <tr>
                    <td style="padding: 11px;">Compliance Status</td>
                    <td style="padding: 11px;">Legal Compliance Check section</td>
                </tr>
                <tr>
                    <td style="padding: 11px;">Priority Areas</td>
                    <td style="padding: 11px;">Materiality Assessment section</td>
                </tr>
                <tr>
                    <td style="padding: 11px;">Action Items</td>
                    <td style="padding: 11px;">ESG Analysis & Recommendations</td>
                </tr>
                <tr>
                    <td style="padding: 11px;">Document Analysis</td>
                    <td style="padding: 11px;">Document Verification & Key Indicators</td>
                </tr>
            </table>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 22px; margin-top: 22px; margin-bottom: 12px;">🎨 Understanding Colors and Symbols</h2>
            
            <div class="highlight-box" style="padding: 16px; margin: 16px 0;">
                <h3 style="font-size: 18px; margin-bottom: 12px;">Score Colors:</h3>
                <ul style="list-style: none; margin-left: 0; font-size: 14px;">
                    <li style="margin-bottom: 7px;">🔴 <strong>Red (0-39%)</strong> - Beginner level</li>
                    <li style="margin-bottom: 7px;">🟠 <strong>Orange (40-69%)</strong> - Intermediate level</li>
                    <li style="margin-bottom: 7px;">🟢 <strong>Green (70-100%)</strong> - Advanced level</li>
                </ul>
            </div>

            <div class="info-box" style="margin-top: 16px; padding: 16px;">
                <h3 style="font-size: 18px; margin-bottom: 12px;">Compliance Symbols:</h3>
                <ul style="list-style: none; margin-left: 0; font-size: 14px;">
                    <li style="margin-bottom: 7px;">✅ <strong>Compliant</strong> - Fully aligned</li>
                    <li style="margin-bottom: 7px;">⚠️ <strong>Partial</strong> - Partially aligned</li>
                    <li style="margin-bottom: 7px;">❌ <strong>Non-compliant</strong> - Not aligned</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
        <div class="page-number">Page 5</div>
    </div>

    <!-- FAQ Page -->
    <div class="page">
        <h1 style="font-size: 30px; margin-bottom: 22px;">❓ Frequently Asked Questions</h1>
        
        <div class="section" style="margin-bottom: 22px;">
            <h3 style="font-size: 19px; margin-top: 20px; margin-bottom: 12px; color: #1e293b;">Q: What if my score is low?</h3>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">A: A low score indicates areas for improvement. Focus on the recommendations section and start with basic policies and monitoring systems.</p>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h3 style="font-size: 19px; margin-top: 20px; margin-bottom: 12px; color: #1e293b;">Q: How often should I review this report?</h3>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">A: Review quarterly and reassess annually. Track progress on recommendations regularly.</p>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h3 style="font-size: 19px; margin-top: 20px; margin-bottom: 12px; color: #1e293b;">Q: Can I share this report with stakeholders?</h3>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">A: Yes, this report is designed for internal use and stakeholder communication. Use it to demonstrate your ESG commitment.</p>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h3 style="font-size: 19px; margin-top: 20px; margin-bottom: 12px; color: #1e293b;">Q: What if I need help understanding specific sections?</h3>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">A: Contact ESGSyncPRO support at esgsync@protonmail.com for assistance.</p>
        </div>

        <div class="footer">
            <p>ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
        <div class="page-number">Page 6</div>
    </div>

    <!-- Need Help Page -->
    <div class="page">
        <h1 style="font-size: 30px; margin-bottom: 22px;">📞 Need Help?</h1>
        
        <div class="section">
            <div class="highlight-box" style="padding: 20px; text-align: center; border-left: none;">
                <h2 style="margin-bottom: 16px; font-size: 22px;">Contact ESGSyncPRO</h2>
                <p style="font-size: 16px; margin-bottom: 12px;"><strong>Email:</strong> esgsync@protonmail.com</p>
                <p style="font-size: 16px; margin-bottom: 12px;"><strong>Website:</strong> esgsync.pro</p>
            </div>
        </div>

        <div class="section">
            <div class="info-box">
                <p style="text-align: center; font-size: 16px; line-height: 1.5;">Our support team is ready to assist you with any questions about your ESG report.</p>
            </div>
        </div>

        <div class="footer">
            <p>ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
        <div class="page-number">Page 7</div>
    </div>
</body>
</html>
`;

const getPolishHTML = () => `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instrukcja czytania raportu ESG</title>
    <style>${getStyles()}</style>
</head>
<body>
    <!-- Cover Page -->
    <div class="page" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 10px 20px 0px 20px; min-height: 1123px !important; max-height: 1123px !important; overflow: hidden !important; box-sizing: border-box !important; position: relative; page-break-after: always !important; page-break-inside: avoid !important;">
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%;">
            <h1 style="font-size: 28px; border: none; margin-bottom: 8px; line-height: 1.2; margin-top: 0;">📖</h1>
            <h1 style="font-size: 24px; border: none; margin-bottom: 15px; line-height: 1.2;">Instrukcja czytania raportu ESG</h1>
            <div style="font-size: 13px; color: #64748b; max-width: 500px; margin-top: 12px;">
                <p style="margin-bottom: 8px; line-height: 1.4;">Ten przewodnik pomoże Ci zrozumieć i zinterpretować Twój Raport Oceny ESG.</p>
            </div>
        </div>
        <div class="footer" style="position: absolute; bottom: 0px; left: 0; right: 0; text-align: center; padding: 0; height: auto;">
            <p style="font-size: 9px; margin: 0;">ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
    </div>

    <!-- Page 1 -->
    <div class="page">
        <h1 style="font-size: 30px; margin-bottom: 22px;">📋 Instrukcja czytania raportu ESG</h1>
        
        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">📊 Przegląd struktury raportu</h2>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">Twój Raport Oceny ESG zawiera kilka kluczowych sekcji, które zapewniają kompleksowy obraz wyników zrównoważonego rozwoju Twojej organizacji:</p>
            <ol style="font-size: 15px; margin-left: 24px; margin-bottom: 14px;">
                <li style="margin-bottom: 7px;"><strong>Strona tytułowa</strong> - Ogólny wynik ESG i interpretacja</li>
                <li style="margin-bottom: 7px;"><strong>Szybka ocena ESG</strong> - Podsumowanie informacji o firmie i oceny</li>
                <li style="margin-bottom: 7px;"><strong>Szczegółowe wyniki ESG</strong> - Podział na Środowisko (E), Społeczne (S), Zarządzanie (G) i Łańcuch dostaw</li>
                <li style="margin-bottom: 7px;"><strong>Podsumowanie wykonawcze</strong> - Kluczowe ustalenia i interpretacja wyników</li>
                <li style="margin-bottom: 7px;"><strong>Analiza filarów</strong> - Szczegółowa analiza filarów E, S i G</li>
                <li style="margin-bottom: 7px;"><strong>Weryfikacja zgodności prawnej</strong> - Weryfikacja zgodności z wymogami regulacyjnymi</li>
                <li style="margin-bottom: 7px;"><strong>Ocena istotności</strong> - Znaczenie różnych czynników ESG dla Twojej branży</li>
                <li style="margin-bottom: 7px;"><strong>Analiza ESG i rekomendacje</strong> - Praktyczne spostrzeżenia i następne kroki</li>
                <li style="margin-bottom: 7px;"><strong>Weryfikacja dokumentów</strong> - Analiza przesłanych dokumentów ESG (jeśli zostały dostarczone)</li>
                <li style="margin-bottom: 7px;"><strong>Kluczowe wskaźniki ESG</strong> - Wyodrębnione metryki z Twoich dokumentów (jeśli zostały dostarczone)</li>
            </ol>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">🎯 Zrozumienie ogólnego wyniku</h2>
            <div class="highlight-box" style="padding: 18px; margin: 18px 0;">
                <p style="font-size: 15px; margin: 0; line-height: 1.5;"><strong>Twój ogólny wynik ESG</strong> jest obliczany na podstawie odpowiedzi na pytania dotyczące gotowości strategicznej w czterech głównych obszarach: Środowisko (E), Społeczne (S), Zarządzanie (G) i Łańcuch dostaw. Maksymalny możliwy wynik to 85 punktów, który następnie jest przeliczany na procenty.</p>
            </div>
            <h3 style="font-size: 19px; margin-top: 18px; margin-bottom: 12px;">Interpretacja wyniku:</h3>
            <table style="font-size: 14px; margin: 18px 0;">
                <tr>
                    <th style="padding: 12px;">Zakres wyniku</th>
                    <th style="padding: 12px;">Poziom</th>
                    <th style="padding: 12px;">Znaczenie</th>
                </tr>
                <tr>
                    <td style="padding: 12px;">0-39%</td>
                    <td style="padding: 12px;">🔴 Początkowy</td>
                    <td style="padding: 12px;">Niski poziom dojrzałości w zakresie zrównoważonego rozwoju. Wymagane pilne działania w obszarach środowiskowych, społecznych i zarządczych.</td>
                </tr>
                <tr>
                    <td style="padding: 12px;">40-69%</td>
                    <td style="padding: 12px;">🟠 Średni</td>
                    <td style="padding: 12px;">Średnia dojrzałość. Masz podstawy, ale potrzebujesz poprawy w standaryzacji i uzupełnieniu polityk.</td>
                </tr>
                <tr>
                    <td style="padding: 12px;">70-100%</td>
                    <td style="padding: 12px;">🟢 Zaawansowany</td>
                    <td style="padding: 12px;">Wysoka dojrzałość. Dobrze rozwinięte procesy ESG. Rozważ rozszerzenie zakresu raportowania i weryfikację zewnętrzną.</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
        <div class="page-number">Strona 2</div>
    </div>

    <!-- Page 2 -->
    <div class="page">
        <h1 style="font-size: 30px; margin-bottom: 22px;">📋 Instrukcja czytania raportu ESG (cd.)</h1>
        
        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">📈 Zrozumienie wyników filarów</h2>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">Twój raport dzieli wyniki na cztery główne obszary:</p>
            <ul style="font-size: 15px; margin-left: 24px; margin-bottom: 14px;">
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>🌿 Środowisko (E)</strong> - Maksymalnie 30 punktów. Obejmuje monitorowanie zużycia energii, śledzenie emisji CO₂, raportowanie zakresów (1, 2, 3), wykorzystanie energii odnawialnej, cele środowiskowe i polityki środowiskowe.</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>👥 Społeczne (S)</strong> - Maksymalnie 25 punktów. Obejmuje różnorodność, równość i integrację (DEI), reprezentację kobiet w zarządzaniu, śledzenie incydentów zdrowia i bezpieczeństwa, ochronę sygnalistów oraz programy szkoleniowe ESG.</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>🏛️ Zarządzanie (G)</strong> - Maksymalnie 20 punktów. Obejmuje zarządzanie ryzykiem, ujawnianie wynagrodzeń kadry kierowniczej, przejrzystość struktury własności oraz procesy kontroli jakości i audytu.</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>📦 Łańcuch dostaw</strong> - Maksymalnie 15 punktów. Ocenia ocenę zasięgu dostawców, procesy zbierania danych oraz częstotliwość oceny zrównoważonego rozwoju łańcucha dostaw.</li>
            </ul>
            <div class="info-box" style="padding: 16px; margin: 16px 0;">
                <p style="font-size: 15px; margin: 0; line-height: 1.5;"><strong>💡 Wskazówka:</strong> Każdy obszar jest oceniany niezależnie. Niski wynik w jednym obszarze niekoniecznie oznacza słabe ogólne wyniki, ale wskazuje, gdzie potrzebna jest poprawa. Całkowity wynik (E + S + G + Łańcuch dostaw) jest obliczany z maksymalnie 85 punktów.</p>
            </div>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">✅ Weryfikacja zgodności prawnej</h2>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">Ta sekcja weryfikuje Twoje dostosowanie do kluczowych ram regulacyjnych:</p>
            <ul style="font-size: 15px; margin-left: 24px; margin-bottom: 14px;">
                <li style="margin-bottom: 7px;"><strong>CSRD/ESRS</strong> - Zgodność ze standardami raportowania zrównoważonego rozwoju UE</li>
                <li style="margin-bottom: 7px;"><strong>Podwójna istotność</strong> - Ocena zarówno istotności finansowej, jak i wpływu</li>
                <li style="margin-bottom: 7px;"><strong>Taksonomia UE</strong> - Dostosowanie do Taksonomii UE dla zrównoważonych działań</li>
                <li style="margin-bottom: 7px;"><strong>DNSH i zabezpieczenia</strong> - Zasada "Nie powoduj znaczącej szkody" i minimalne zabezpieczenia</li>
                <li style="margin-bottom: 7px;"><strong>SFDR</strong> - Obowiązki rozporządzenia w sprawie ujawniania informacji dotyczących zrównoważonego finansowania</li>
                <li style="margin-bottom: 7px;"><strong>Assurance</strong> - Status niezależnej weryfikacji</li>
            </ul>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">Każda pozycja pokazuje Twój status zgodności: ✅ Zgodny, ⚠️ Częściowy, lub ❌ Niezgodny.</p>
        </div>

        <div class="footer">
            <p>ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
        <div class="page-number">Strona 3</div>
    </div>

    <!-- Page 3 -->
    <div class="page">
        <h1 style="font-size: 30px; margin-bottom: 22px;">📋 Instrukcja czytania raportu ESG (cd.)</h1>
        
        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">🎯 Ocena istotności</h2>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">Sekcja istotności pokazuje względne znaczenie różnych czynników ESG dla Twojej konkretnej branży. To pomaga Ci określić priorytety, na czym się skupić.</p>
            <div class="highlight-box" style="padding: 18px; margin: 18px 0;">
                <p style="font-size: 15px; margin: 0; line-height: 1.5;"><strong>Zrozumienie wartości istotności:</strong> Wyższe wartości wskazują, że dany czynnik ESG jest bardziej krytyczny dla Twojej branży. Skup się najpierw na poprawie obszarów o wysokich wartościach istotności.</p>
            </div>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">💡 Sekcja rekomendacji</h2>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">To jedna z najbardziej praktycznych części Twojego raportu. Zawiera:</p>
            <ul style="font-size: 15px; margin-left: 24px; margin-bottom: 14px;">
                <li style="margin-bottom: 7px;"><strong>Dlaczego</strong> - Wyjaśnienie, dlaczego potrzebne są ulepszenia</li>
                <li style="margin-bottom: 7px;"><strong>Jak</strong> - Konkretne kroki, które możesz podjąć, aby się poprawić</li>
                <li style="margin-bottom: 7px;"><strong>Działania priorytetowe</strong> - Na czym skupić się najpierw</li>
            </ul>
            <div class="info-box" style="padding: 16px; margin: 16px 0;">
                <p style="font-size: 15px; margin: 0; line-height: 1.5;"><strong>📌 Zadanie do wykonania:</strong> Regularnie przeglądaj rekomendacje i śledź swoje postępy. Rozważ przypisanie odpowiedzialności za każdą rekomendację konkretnym członkom zespołu.</p>
            </div>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">📄 Weryfikacja dokumentów i kluczowe wskaźniki</h2>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">Jeśli przesłałeś dokumenty ESG, raport zawiera:</p>
            <ul style="font-size: 15px; margin-left: 24px; margin-bottom: 14px;">
                <li style="margin-bottom: 7px;"><strong>Analiza dokumentów</strong> - Weryfikacja kompletności dokumentów i dostosowania do standardów</li>
                <li style="margin-bottom: 7px;"><strong>Wyodrębnione metryki</strong> - Kluczowe wskaźniki ESG automatycznie wyodrębnione z Twoich dokumentów</li>
                <li style="margin-bottom: 7px;"><strong>Rekomendacje</strong> - Konkretne sugestie oparte na treści Twoich dokumentów</li>
            </ul>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 23px; margin-top: 22px; margin-bottom: 14px;">🚀 Następne kroki</h2>
            <ol style="font-size: 15px; margin-left: 24px; margin-bottom: 14px;">
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>Przejrzyj swój ogólny wynik</strong> - Zrozum, gdzie stoisz pod względem dojrzałości ESG</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>Zidentyfikuj obszary priorytetowe</strong> - Skup się na filarach z niższymi wynikami lub wyższą istotnością</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>Przejrzyj rekomendacje</strong> - Utwórz plan działania na podstawie dostarczonych rekomendacji</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>Ustal cele</strong> - Ustal konkretne, mierzalne cele poprawy</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>Monitoruj postępy</strong> - Regularnie ponownie oceniaj swoje wyniki ESG</li>
                <li style="margin-bottom: 7px; line-height: 1.5;"><strong>Rozważ wsparcie zewnętrzne</strong> - W razie potrzeby poszukaj profesjonalnej pomocy w złożonych obszarach</li>
            </ol>
        </div>

        <div class="footer">
            <p>ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
        <div class="page-number">Strona 4</div>
    </div>

    <!-- Quick Reference Page -->
    <div class="page">
        <h1 style="font-size: 30px; margin-bottom: 22px;">📌 Szybki przewodnik</h1>
        
        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 22px; margin-top: 22px; margin-bottom: 12px;">🔍 Gdzie znaleźć informacje</h2>
            
            <table style="font-size: 14px; margin: 17px 0;">
                <tr>
                    <th style="width: 40%; padding: 11px;">Czego potrzebujesz</th>
                    <th style="padding: 11px;">Gdzie szukać</th>
                </tr>
                <tr>
                    <td style="padding: 11px;">Ogólny wynik ESG</td>
                    <td style="padding: 11px;">Strona tytułowa</td>
                </tr>
                <tr>
                    <td style="padding: 11px;">Szczegółowe wyniki filarów</td>
                    <td style="padding: 11px;">Sekcja szczegółowych wyników ESG</td>
                </tr>
                <tr>
                    <td style="padding: 11px;">Status zgodności</td>
                    <td style="padding: 11px;">Sekcja weryfikacji zgodności prawnej</td>
                </tr>
                <tr>
                    <td style="padding: 11px;">Obszary priorytetowe</td>
                    <td style="padding: 11px;">Sekcja oceny istotności</td>
                </tr>
                <tr>
                    <td style="padding: 11px;">Zadania do wykonania</td>
                    <td style="padding: 11px;">Analiza ESG i rekomendacje</td>
                </tr>
                <tr>
                    <td style="padding: 11px;">Analiza dokumentów</td>
                    <td style="padding: 11px;">Weryfikacja dokumentów i kluczowe wskaźniki</td>
                </tr>
            </table>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h2 style="font-size: 22px; margin-top: 22px; margin-bottom: 12px;">🎨 Zrozumienie kolorów i symboli</h2>
            
            <div class="highlight-box" style="padding: 16px; margin: 16px 0;">
                <h3 style="font-size: 18px; margin-bottom: 12px;">Kolory wyników:</h3>
                <ul style="list-style: none; margin-left: 0; font-size: 14px;">
                    <li style="margin-bottom: 7px;">🔴 <strong>Czerwony (0-39%)</strong> - Poziom początkowy</li>
                    <li style="margin-bottom: 7px;">🟠 <strong>Pomarańczowy (40-69%)</strong> - Poziom średni</li>
                    <li style="margin-bottom: 7px;">🟢 <strong>Zielony (70-100%)</strong> - Poziom zaawansowany</li>
                </ul>
            </div>

            <div class="info-box" style="margin-top: 16px; padding: 16px;">
                <h3 style="font-size: 18px; margin-bottom: 12px;">Symbole zgodności:</h3>
                <ul style="list-style: none; margin-left: 0; font-size: 14px;">
                    <li style="margin-bottom: 7px;">✅ <strong>Zgodny</strong> - W pełni zgodne</li>
                    <li style="margin-bottom: 7px;">⚠️ <strong>Częściowy</strong> - Częściowo zgodne</li>
                    <li style="margin-bottom: 7px;">❌ <strong>Niezgodny</strong> - Niezgodne</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
        <div class="page-number">Strona 5</div>
    </div>

    <!-- FAQ Page -->
    <div class="page">
        <h1 style="font-size: 30px; margin-bottom: 22px;">❓ Często zadawane pytania</h1>
        
        <div class="section" style="margin-bottom: 22px;">
            <h3 style="font-size: 19px; margin-top: 20px; margin-bottom: 12px; color: #1e293b;">P: Co jeśli mój wynik jest niski?</h3>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">O: Niski wynik wskazuje obszary do poprawy. Skup się na sekcji rekomendacji i zacznij od podstawowych polityk i systemów monitorowania.</p>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h3 style="font-size: 19px; margin-top: 20px; margin-bottom: 12px; color: #1e293b;">P: Jak często powinienem przeglądać ten raport?</h3>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">O: Przeglądaj kwartalnie i ponownie oceniaj corocznie. Regularnie śledź postępy w rekomendacjach.</p>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h3 style="font-size: 19px; margin-top: 20px; margin-bottom: 12px; color: #1e293b;">P: Czy mogę udostępnić ten raport interesariuszom?</h3>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">O: Tak, ten raport jest przeznaczony do użytku wewnętrznego i komunikacji z interesariuszami. Użyj go, aby wykazać swoje zaangażowanie w ESG.</p>
        </div>

        <div class="section" style="margin-bottom: 22px;">
            <h3 style="font-size: 19px; margin-top: 20px; margin-bottom: 12px; color: #1e293b;">P: Co jeśli potrzebuję pomocy w zrozumieniu konkretnych sekcji?</h3>
            <p style="font-size: 15px; margin-bottom: 14px; line-height: 1.5;">O: Skontaktuj się z pomocą ESGSyncPRO pod adresem esgsync@protonmail.com w celu uzyskania pomocy.</p>
        </div>

        <div class="footer">
            <p>ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
        <div class="page-number">Strona 6</div>
    </div>

    <!-- Need Help Page -->
    <div class="page">
        <h1 style="font-size: 30px; margin-bottom: 22px;">📞 Potrzebujesz pomocy?</h1>
        
        <div class="section">
            <div class="highlight-box" style="padding: 20px; text-align: center; border-left: none;">
                <h2 style="margin-bottom: 16px; font-size: 22px;">Skontaktuj się z ESGSyncPRO</h2>
                <p style="font-size: 16px; margin-bottom: 12px;"><strong>Email:</strong> esgsync@protonmail.com</p>
                <p style="font-size: 16px; margin-bottom: 12px;"><strong>Strona internetowa:</strong> esgsync.pro</p>
            </div>
        </div>

        <div class="section">
            <div class="info-box">
                <p style="text-align: center; font-size: 16px; line-height: 1.5;">Nasz zespół wsparcia jest gotowy pomóc Ci w każdej kwestii dotyczącej Twojego raportu ESG.</p>
            </div>
        </div>

        <div class="footer">
            <p>ESGSyncPRO | esgsync.pro | esgsync@protonmail.com</p>
        </div>
        <div class="page-number">Strona 7</div>
    </div>
</body>
</html>
`;

async function generatePDF(html, outputPath) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });
        
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            },
            preferCSSPageSize: true,
            displayHeaderFooter: false
        });
        
        console.log(`✅ PDF generated successfully: ${outputPath}`);
        console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

async function generateAllPDFs() {
    console.log('Starting PDF generation...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        // Generate English PDF
        console.log('Generating English PDF...');
        const englishPage = await browser.newPage();
        await englishPage.setContent(getEnglishHTML(), {
            waitUntil: 'networkidle0'
        });
        
        const englishPath = path.join(__dirname, 'report-reading-instruction-en.pdf');
        await englishPage.pdf({
            path: englishPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            },
            preferCSSPageSize: true,
            displayHeaderFooter: false
        });
        await englishPage.close();
        console.log(`✅ English PDF generated: ${englishPath}`);
        console.log(`File size: ${(fs.statSync(englishPath).size / 1024).toFixed(2)} KB`);
        
        // Generate Polish PDF
        console.log('Generating Polish PDF...');
        const polishPage = await browser.newPage();
        await polishPage.setContent(getPolishHTML(), {
            waitUntil: 'networkidle0'
        });
        
        const polishPath = path.join(__dirname, 'report-reading-instruction-pl.pdf');
        await polishPage.pdf({
            path: polishPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            },
            preferCSSPageSize: true,
            displayHeaderFooter: false
        });
        await polishPage.close();
        console.log(`✅ Polish PDF generated: ${polishPath}`);
        console.log(`File size: ${(fs.statSync(polishPath).size / 1024).toFixed(2)} KB`);
        
        console.log('\n✅ All PDFs generated successfully!');
        
    } catch (error) {
        console.error('Error generating PDFs:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the generator
generateAllPDFs().catch(console.error);
