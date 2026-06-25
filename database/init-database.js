const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Load .env from project root (when run as node database/init-database.js)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Create a .env file in the project root, for example:');
    console.error('  DATABASE_URL=postgresql://user:password@localhost:5432/dbname');
    console.error('  or copy the connection string from the Neon dashboard.');
    process.exit(1);
}

const { query } = require('./database');

async function initializeDatabase() {
    try {
        // Read schema from file
        const schema = fs.readFileSync(path.join(__dirname, 'database-schema.sql'), 'utf8');
        await query(schema);
        
        // Check created tables
        const tables = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        // Add test data
        // Add test company
        const companyResult = await query(
            'INSERT INTO companies (name, industry, esg_level) VALUES ($1, $2, $3) RETURNING id',
            ['Sample Company', 'Technology', 'intermediate']
        );
        
        const companyId = companyResult.rows[0].id;
        
        // Add test ESG report
        const reportResult = await query(
            `INSERT INTO esg_reports (company_id, title, language, esg_level, content, status) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [
                companyId, 
                'Sample ESG Report 2024', 
                'en', 
                'intermediate', 
                JSON.stringify({
                    executiveSummary: 'This is a sample ESG report',
                    environmentalImpact: 'Environmental initiatives and metrics',
                    socialResponsibility: 'Social responsibility programs',
                    governanceStructure: 'Corporate governance framework'
                }), 
                'published'
            ]
        );
        
        const reportId = reportResult.rows[0].id;
        
        // Add test metrics
        const metrics = [
            { category: 'environmental', metricName: 'Carbon Emissions', value: 150.5, unit: 'tons CO2', description: 'Annual carbon emissions' },
            { category: 'environmental', metricName: 'Energy Consumption', value: 2500, unit: 'MWh', description: 'Total energy consumption' },
            { category: 'social', metricName: 'Employee Satisfaction', value: 85, unit: '%', description: 'Employee satisfaction score' },
            { category: 'social', metricName: 'Diversity Index', value: 72, unit: '%', description: 'Workforce diversity index' },
            { category: 'governance', metricName: 'Board Independence', value: 80, unit: '%', description: 'Percentage of independent board members' },
            { category: 'governance', metricName: 'Ethics Score', value: 90, unit: '%', description: 'Corporate ethics compliance score' }
        ];
        
        for (const metric of metrics) {
            await query(
                `INSERT INTO esg_metrics (report_id, category, metric_name, value, unit, description) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [reportId, metric.category, metric.metricName, metric.value, metric.unit, metric.description]
            );
        }
        
        // Company benchmarks (section 7) — names aligned with survey form
        const benchmarks = [
            { company_name: 'Skanska And', industry: 'construction', scope1: 1200, ren: 42, paygap: 8 },
            { company_name: 'Essential Bouygues Construction', industry: 'construction', scope1: 2100, ren: 28, paygap: 12 },
            { company_name: 'Hochtief Group Double Materiality Assessment', industry: 'construction', scope1: 1800, ren: 35, paygap: 10 },
            { company_name: 'Sprawozdanie Z Dzialalnosci Grupy Budimex I Budir', industry: 'construction', scope1: 950, ren: 22, paygap: 15 },
            { company_name: 'Tokyo', industry: 'construction', scope1: 3100, ren: 18, paygap: 20 },
            { company_name: 'PayPal', industry: 'fintech', scope1: 50, ren: 85, paygap: 5 },
            { company_name: 'Shopify', industry: 'fintech', scope1: 30, ren: 100, paygap: 3 },
            { company_name: 'NVIDIA', industry: 'it', scope1: 200, ren: 60, paygap: 8 },
            { company_name: 'Microsoft', industry: 'it', scope1: 450, ren: 75, paygap: 6 },
        ];
        for (const b of benchmarks) {
            await query(
                `INSERT INTO company_benchmarks (company_name, industry, scope1, ren, paygap)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (company_name, industry) DO UPDATE SET scope1 = EXCLUDED.scope1, ren = EXCLUDED.ren, paygap = EXCLUDED.paygap`,
                [b.company_name, b.industry, b.scope1, b.ren, b.paygap]
            );
        }

        // Survey comparison list: copy from company_benchmarks (does not modify source table)
        await query(
            `INSERT INTO survey_comparison_companies (industry, company_name, scope1, ren, paygap)
             SELECT b.industry, b.company_name, b.scope1, b.ren, b.paygap FROM company_benchmarks b
             WHERE NOT EXISTS (SELECT 1 FROM survey_comparison_companies s WHERE s.industry = b.industry AND s.company_name = b.company_name)`
        );

        // Default admin when table is empty (credentials from .env)
        const adminCount = await query('SELECT COUNT(*) AS n FROM admin_users');
        if (parseInt(adminCount.rows[0].n, 10) === 0) {
            const adminUsername = process.env.ADMIN_USERNAME || 'admin@gmail.com';
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
            const hash = await bcrypt.hash(adminPassword, 10);
            await query(
                'INSERT INTO admin_users (username, password_hash, full_name) VALUES ($1, $2, $3)',
                [adminUsername, hash, 'Administrator']
            );
            console.log(`Created admin: username ${adminUsername}, password from ADMIN_PASSWORD or "admin"`);
        }

        // Default app user for survey login (when table is empty)
        const appUsersCount = await query('SELECT COUNT(*) AS n FROM app_users');
        if (parseInt(appUsersCount.rows[0].n, 10) === 0) {
            const defaultUserEmail = process.env.DEFAULT_USER_EMAIL || 'admin@gmail.com';
            const defaultUserPassword = process.env.DEFAULT_USER_PASSWORD || 'admin';
            const hash = await bcrypt.hash(defaultUserPassword, 10);
            await query(
                'INSERT INTO app_users (email, password_hash, full_name, company_name) VALUES ($1, $2, $3, $4)',
                [defaultUserEmail, hash, process.env.DEFAULT_USER_FULL_NAME || 'Default User', 'Sample Company']
            );
            console.log(`Created app user: email ${defaultUserEmail}, password from DEFAULT_USER_PASSWORD or "admin"`);
        }

        // Show statistics
        const stats = await query(`
            SELECT 
                (SELECT COUNT(*) FROM companies) as total_companies,
                (SELECT COUNT(*) FROM esg_reports) as total_reports,
                (SELECT COUNT(*) FROM esg_metrics) as total_metrics,
                (SELECT COUNT(*) FROM company_benchmarks) as total_benchmarks
        `);
        
    } catch (error) {
        console.error('Database initialization failed:', error.message);
        process.exit(1);
    }
}

// Run initialization if file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };