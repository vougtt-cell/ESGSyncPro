const { query } = require('./database');
const bcrypt = require('bcrypt');

async function ensureUserDataUserIdColumn() {
    await query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'user_data' AND column_name = 'user_id'
            ) THEN
                ALTER TABLE user_data ADD COLUMN user_id INTEGER;
            END IF;
        END $$;
    `);
    await query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'fk_user_data_user_id' AND table_name = 'user_data'
            ) THEN
                ALTER TABLE user_data
                    ADD CONSTRAINT fk_user_data_user_id
                    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL;
            END IF;
        END $$;
    `);
}

async function ensureSurveyComparisonCompaniesTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS survey_comparison_companies (
            id SERIAL PRIMARY KEY,
            industry VARCHAR(100) NOT NULL,
            company_name VARCHAR(255) NOT NULL,
            scope1 DECIMAL(15,3),
            ren DECIMAL(5,2),
            paygap DECIMAL(5,2),
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_survey_comparison_industry ON survey_comparison_companies(industry)');
}

async function ensureArticlesTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS articles (
            id SERIAL PRIMARY KEY,
            title_en VARCHAR(500) NOT NULL,
            title_pl VARCHAR(500) NOT NULL,
            description_en TEXT NOT NULL,
            description_pl TEXT NOT NULL,
            content_en TEXT,
            content_pl TEXT,
            author_name VARCHAR(255) NOT NULL,
            author_avatar_url VARCHAR(500),
            thumbnail_url VARCHAR(500) NOT NULL,
            published_date DATE NOT NULL,
            status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            view_count INTEGER DEFAULT 0,
            slug VARCHAR(255) UNIQUE
        )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_date DESC)');
    await query('CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status)');
}

async function ensureCompanyBenchmarksTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS company_benchmarks (
            id SERIAL PRIMARY KEY,
            company_name VARCHAR(255) NOT NULL,
            industry VARCHAR(100) NOT NULL,
            scope1 DECIMAL(15,3),
            ren DECIMAL(5,2),
            paygap DECIMAL(5,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(company_name, industry)
        )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_company_benchmarks_industry ON company_benchmarks(industry)');
    await query('CREATE INDEX IF NOT EXISTS idx_company_benchmarks_company_name ON company_benchmarks(company_name)');
}

async function ensureCompaniesTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS companies (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            industry VARCHAR(100),
            esg_level VARCHAR(20) CHECK (esg_level IN ('beginner', 'intermediate', 'advanced')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry)');
    await query('CREATE INDEX IF NOT EXISTS idx_companies_esg_level ON companies(esg_level)');
}

async function bootstrapDatabase() {
    await ensureAppUsersTable();
    await ensureAdminUsersTable();
    await ensureUserDataTable();
    await ensureUserDataUserIdColumn();
    await ensureSurveyComparisonCompaniesTable();
    await ensureArticlesTable();
    await ensureCompanyBenchmarksTable();
    await ensureCompaniesTable();
    await ensureDefaultAdmin();
    await ensureDefaultAppUser();
    await ensureSampleSurveyCompanies();
    await ensureSampleArticles();
    await ensureSampleCompanyBenchmarks();
    await ensureSampleCompanies();
}

async function ensureAppUsersTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS app_users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            company_name VARCHAR(255),
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email)');
}

async function ensureAdminUsersTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS admin_users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            email VARCHAR(255),
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username)');
}

async function ensureUserDataTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS user_data (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            session_id VARCHAR(255) UNIQUE,
            company_name VARCHAR(255),
            industry VARCHAR(100),
            esg_level VARCHAR(20) CHECK (esg_level IN ('beginner', 'intermediate', 'advanced')),
            language VARCHAR(10) DEFAULT 'en',
            custom_data JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_user_data_session_id ON user_data(session_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id)');
}

async function ensureDefaultAdmin() {
    const adminCount = await query('SELECT COUNT(*) AS n FROM admin_users');
    if (parseInt(adminCount.rows[0].n, 10) === 0) {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin@gmail.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
        const hash = await bcrypt.hash(adminPassword, 10);
        await query(
            'INSERT INTO admin_users (username, password_hash, full_name) VALUES ($1, $2, $3)',
            [adminUsername, hash, 'Administrator']
        );
        console.log(`Created default admin: username ${adminUsername}`);
    }
}

async function ensureDefaultAppUser() {
    const appUsersCount = await query('SELECT COUNT(*) AS n FROM app_users');
    if (parseInt(appUsersCount.rows[0].n, 10) === 0) {
        const defaultUserEmail = process.env.DEFAULT_USER_EMAIL || 'admin@gmail.com';
        const defaultUserPassword = process.env.DEFAULT_USER_PASSWORD || 'admin';
        const hash = await bcrypt.hash(defaultUserPassword, 10);
        await query(
            'INSERT INTO app_users (email, password_hash, full_name, company_name) VALUES ($1, $2, $3, $4)',
            [defaultUserEmail, hash, process.env.DEFAULT_USER_FULL_NAME || 'Default User', 'Sample Company']
        );
        console.log(`Created default app user: email ${defaultUserEmail}`);
    }
}

async function ensureSampleSurveyCompanies() {
    const count = await query('SELECT COUNT(*) AS n FROM survey_comparison_companies');
    if (parseInt(count.rows[0].n, 10) === 0) {
        const benchmarks = [
            // Construction - 5 companies
            { company_name: 'Skanska AB', industry: 'construction', scope1: 1200, ren: 42, paygap: 8 },
            { company_name: 'Essential Bouygues Construction', industry: 'construction', scope1: 2100, ren: 28, paygap: 12 },
            { company_name: 'Hochtief Group', industry: 'construction', scope1: 1800, ren: 35, paygap: 10 },
            { company_name: 'Budimex', industry: 'construction', scope1: 950, ren: 22, paygap: 15 },
            { company_name: 'Vinci Construction', industry: 'construction', scope1: 1650, ren: 31, paygap: 11 },
            // Fintech - 5 companies
            { company_name: 'PayPal', industry: 'fintech', scope1: 50, ren: 85, paygap: 5 },
            { company_name: 'Shopify', industry: 'fintech', scope1: 30, ren: 100, paygap: 3 },
            { company_name: 'Stripe', industry: 'fintech', scope1: 40, ren: 92, paygap: 4 },
            { company_name: 'Square', industry: 'fintech', scope1: 35, ren: 88, paygap: 6 },
            { company_name: 'Adyen', industry: 'fintech', scope1: 45, ren: 78, paygap: 7 },
            // IT - 5 companies
            { company_name: 'NVIDIA', industry: 'it', scope1: 200, ren: 60, paygap: 8 },
            { company_name: 'Microsoft', industry: 'it', scope1: 450, ren: 75, paygap: 6 },
            { company_name: 'Apple', industry: 'it', scope1: 380, ren: 68, paygap: 7 },
            { company_name: 'Google', industry: 'it', scope1: 320, ren: 65, paygap: 9 },
            { company_name: 'Meta', industry: 'it', scope1: 290, ren: 58, paygap: 10 },
            // Retail - 5 companies
            { company_name: 'Amazon', industry: 'retail', scope1: 520, ren: 45, paygap: 12 },
            { company_name: 'IKEA', industry: 'retail', scope1: 280, ren: 55, paygap: 9 },
            { company_name: 'Walmart', industry: 'retail', scope1: 680, ren: 38, paygap: 14 },
            { company_name: 'Zara', industry: 'retail', scope1: 310, ren: 48, paygap: 11 },
            { company_name: 'H&M', industry: 'retail', scope1: 340, ren: 42, paygap: 13 },
            // Manufacturing - 5 companies
            { company_name: 'Tesla', industry: 'manufacturing', scope1: 180, ren: 72, paygap: 11 },
            { company_name: 'Volkswagen', industry: 'manufacturing', scope1: 890, ren: 38, paygap: 14 },
            { company_name: 'Toyota', industry: 'manufacturing', scope1: 720, ren: 45, paygap: 12 },
            { company_name: 'Siemens', industry: 'manufacturing', scope1: 540, ren: 52, paygap: 10 },
            { company_name: 'General Electric', industry: 'manufacturing', scope1: 610, ren: 48, paygap: 13 },
            // Logistics - 5 companies
            { company_name: 'DHL', industry: 'logistics', scope1: 620, ren: 48, paygap: 10 },
            { company_name: 'FedEx', industry: 'logistics', scope1: 580, ren: 52, paygap: 9 },
            { company_name: 'UPS', industry: 'logistics', scope1: 550, ren: 55, paygap: 8 },
            { company_name: 'DB Schenker', industry: 'logistics', scope1: 490, ren: 45, paygap: 11 },
            { company_name: 'Kuehne+Nagel', industry: 'logistics', scope1: 530, ren: 42, paygap: 12 },
            // Transport - 5 companies
            { company_name: 'Maersk', industry: 'transport', scope1: 750, ren: 40, paygap: 13 },
            { company_name: 'Delta Air Lines', industry: 'transport', scope1: 890, ren: 35, paygap: 15 },
            { company_name: 'Lufthansa', industry: 'transport', scope1: 820, ren: 38, paygap: 14 },
            { company_name: 'Ryanair', industry: 'transport', scope1: 680, ren: 32, paygap: 16 },
            { company_name: 'Union Pacific', industry: 'transport', scope1: 920, ren: 28, paygap: 17 },
            // Energy - 5 companies
            { company_name: 'Ørsted', industry: 'energy', scope1: 120, ren: 95, paygap: 6 },
            { company_name: 'NextEra Energy', industry: 'energy', scope1: 180, ren: 88, paygap: 7 },
            { company_name: 'Iberdrola', industry: 'energy', scope1: 220, ren: 82, paygap: 8 },
            { company_name: 'EDF', industry: 'energy', scope1: 450, ren: 65, paygap: 10 },
            { company_name: 'Enel', industry: 'energy', scope1: 380, ren: 58, paygap: 11 },
            // Services - 5 companies
            { company_name: 'Accenture', industry: 'services', scope1: 85, ren: 72, paygap: 9 },
            { company_name: 'Deloitte', industry: 'services', scope1: 95, ren: 68, paygap: 10 },
            { company_name: 'PwC', industry: 'services', scope1: 90, ren: 65, paygap: 11 },
            { company_name: 'EY', industry: 'services', scope1: 88, ren: 62, paygap: 12 },
            { company_name: 'KPMG', industry: 'services', scope1: 92, ren: 60, paygap: 13 }
        ];
        for (const b of benchmarks) {
            await query(
                `INSERT INTO survey_comparison_companies (industry, company_name, scope1, ren, paygap)
                 VALUES ($1, $2, $3, $4, $5)`,
                [b.industry, b.company_name, b.scope1, b.ren, b.paygap]
            );
        }
        console.log(`Created ${benchmarks.length} sample survey companies`);
    }
}

async function ensureSampleArticles() {
    const count = await query('SELECT COUNT(*) AS n FROM articles');
    if (parseInt(count.rows[0].n, 10) === 0) {
        const articles = [
            {
                title_en: 'ESG Reporting: A Complete Guide for Beginners',
                title_pl: 'Raportowanie ESG: Kompletny przewodnik dla początkujących',
                description_en: 'Learn the fundamentals of ESG reporting and how to get started with sustainability disclosures.',
                description_pl: 'Poznaj podstawy raportowania ESG i jak rozpocząć ujawnianie informacji o zrównoważonym rozwoju.',
                content_en: 'Environmental, Social, and Governance (ESG) reporting has become essential for modern businesses. This guide covers the key frameworks, metrics, and best practices for creating comprehensive ESG reports that meet stakeholder expectations and regulatory requirements.',
                content_pl: 'Raportowanie środowiskowe, społeczne i korporacyjne (ESG) stało się niezbędne dla współczesnych firm. Ten przewodnik obejmuje kluczowe ramy, metryki i najlepsze praktyki tworzenia kompleksowych raportów ESG.',
                author_name: 'ESG Expert Team',
                author_avatar_url: 'https://ui-avatars.com/api/?name=ESG+Team&background=0D8ABC&color=fff',
                thumbnail_url: 'https://via.placeholder.com/400x200/0D8ABC/ffffff?text=ESG+Guide',
                published_date: '2024-01-15',
                status: 'published'
            },
            {
                title_en: 'The Future of Sustainable Business Practices',
                title_pl: 'Przyszłość zrównoważonych praktyk biznesowych',
                description_en: 'Explore emerging trends and innovations in sustainable business that will shape the corporate landscape.',
                description_pl: 'Poznaj nowe trendy i innowacje w zrównoważonym biznesie, które ukształtują krajobraz korporacyjny.',
                content_en: 'Sustainable business practices are evolving rapidly. From circular economy models to carbon-neutral operations, companies are adopting innovative approaches to reduce environmental impact while maintaining profitability. This article examines the key trends driving this transformation.',
                content_pl: 'Zrównoważone praktyki biznesowe ewoluują szybko. Od modeli gospodarki o obiegu zamkniętym po operacje neutralne pod kątem emisji dwutlenku węgla, firmy przyjmują innowacyjne podejścia do zmniejszenia wpływu na środowisko przy zachowaniu rentowności.',
                author_name: 'Sustainability Analyst',
                author_avatar_url: 'https://ui-avatars.com/api/?name=Sustainability+Analyst&background=22c55e&color=fff',
                thumbnail_url: 'https://via.placeholder.com/400x200/22c55e/ffffff?text=Sustainability',
                published_date: '2024-02-20',
                status: 'published'
            },
            {
                title_en: 'Understanding Carbon Footprint Measurement',
                title_pl: 'Zrozumienie pomiaru śladu węglowego',
                description_en: 'A comprehensive overview of methodologies and tools for measuring and reducing carbon emissions.',
                description_pl: 'Kompleksowy przegląd metodologii i narzędzi do pomiaru i redukcji emisji dwutlenku węgla.',
                content_en: 'Measuring carbon footprint is the first step toward effective climate action. This article explains the different scopes of emissions, calculation methodologies, and practical tools that businesses can use to track and reduce their environmental impact.',
                content_pl: 'Pomiar śladu węglowego jest pierwszym krokiem do skutecznego działania klimatycznego. Ten artykuł wyjaśnia różne zakresy emisji, metodologie obliczeń i praktyczne narzędzia, których firmy mogą używać do śledzenia i redukcji wpływu na środowisko.',
                author_name: 'Climate Specialist',
                author_avatar_url: 'https://ui-avatars.com/api/?name=Climate+Specialist&background=3b82f6&color=fff',
                thumbnail_url: 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=Carbon',
                published_date: '2024-03-10',
                status: 'published'
            }
        ];
        for (const article of articles) {
            const slug = article.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            await query(
                `INSERT INTO articles (title_en, title_pl, description_en, description_pl, content_en, content_pl, author_name, author_avatar_url, thumbnail_url, published_date, status, slug)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [
                    article.title_en, article.title_pl, article.description_en, article.description_pl,
                    article.content_en, article.content_pl, article.author_name, article.author_avatar_url,
                    article.thumbnail_url, article.published_date, article.status, slug
                ]
            );
        }
        console.log(`Created ${articles.length} sample articles`);
    }
}

async function ensureSampleCompanyBenchmarks() {
    const count = await query('SELECT COUNT(*) AS n FROM company_benchmarks');
    if (parseInt(count.rows[0].n, 10) === 0) {
        const benchmarks = [
            { company_name: 'Skanska AB', industry: 'construction', scope1: 1200, ren: 42, paygap: 8 },
            { company_name: 'Essential Bouygues Construction', industry: 'construction', scope1: 2100, ren: 28, paygap: 12 },
            { company_name: 'Hochtief Group', industry: 'construction', scope1: 1800, ren: 35, paygap: 10 },
            { company_name: 'Budimex', industry: 'construction', scope1: 950, ren: 22, paygap: 15 },
            { company_name: 'Vinci Construction', industry: 'construction', scope1: 1650, ren: 31, paygap: 11 },
            { company_name: 'PayPal', industry: 'fintech', scope1: 50, ren: 85, paygap: 5 },
            { company_name: 'Shopify', industry: 'fintech', scope1: 30, ren: 100, paygap: 3 },
            { company_name: 'Stripe', industry: 'fintech', scope1: 40, ren: 92, paygap: 4 },
            { company_name: 'Square', industry: 'fintech', scope1: 35, ren: 88, paygap: 6 },
            { company_name: 'Adyen', industry: 'fintech', scope1: 45, ren: 78, paygap: 7 },
            { company_name: 'NVIDIA', industry: 'it', scope1: 200, ren: 60, paygap: 8 },
            { company_name: 'Microsoft', industry: 'it', scope1: 450, ren: 75, paygap: 6 },
            { company_name: 'Apple', industry: 'it', scope1: 380, ren: 68, paygap: 7 },
            { company_name: 'Google', industry: 'it', scope1: 320, ren: 65, paygap: 9 },
            { company_name: 'Meta', industry: 'it', scope1: 290, ren: 58, paygap: 10 },
            { company_name: 'Amazon', industry: 'retail', scope1: 520, ren: 45, paygap: 12 },
            { company_name: 'IKEA', industry: 'retail', scope1: 280, ren: 55, paygap: 9 },
            { company_name: 'Walmart', industry: 'retail', scope1: 680, ren: 38, paygap: 14 },
            { company_name: 'Zara', industry: 'retail', scope1: 310, ren: 48, paygap: 11 },
            { company_name: 'H&M', industry: 'retail', scope1: 340, ren: 42, paygap: 13 },
            { company_name: 'Tesla', industry: 'manufacturing', scope1: 180, ren: 72, paygap: 11 },
            { company_name: 'Volkswagen', industry: 'manufacturing', scope1: 890, ren: 38, paygap: 14 },
            { company_name: 'Toyota', industry: 'manufacturing', scope1: 720, ren: 45, paygap: 12 },
            { company_name: 'Siemens', industry: 'manufacturing', scope1: 540, ren: 52, paygap: 10 },
            { company_name: 'General Electric', industry: 'manufacturing', scope1: 610, ren: 48, paygap: 13 },
            { company_name: 'DHL', industry: 'logistics', scope1: 620, ren: 48, paygap: 10 },
            { company_name: 'FedEx', industry: 'logistics', scope1: 580, ren: 52, paygap: 9 },
            { company_name: 'UPS', industry: 'logistics', scope1: 550, ren: 55, paygap: 8 },
            { company_name: 'DB Schenker', industry: 'logistics', scope1: 490, ren: 45, paygap: 11 },
            { company_name: 'Kuehne+Nagel', industry: 'logistics', scope1: 530, ren: 42, paygap: 12 },
            { company_name: 'Maersk', industry: 'transport', scope1: 750, ren: 40, paygap: 13 },
            { company_name: 'Delta Air Lines', industry: 'transport', scope1: 890, ren: 35, paygap: 15 },
            { company_name: 'Lufthansa', industry: 'transport', scope1: 820, ren: 38, paygap: 14 },
            { company_name: 'Ryanair', industry: 'transport', scope1: 680, ren: 32, paygap: 16 },
            { company_name: 'Union Pacific', industry: 'transport', scope1: 920, ren: 28, paygap: 17 },
            { company_name: 'Ørsted', industry: 'energy', scope1: 120, ren: 95, paygap: 6 },
            { company_name: 'NextEra Energy', industry: 'energy', scope1: 180, ren: 88, paygap: 7 },
            { company_name: 'Iberdrola', industry: 'energy', scope1: 220, ren: 82, paygap: 8 },
            { company_name: 'EDF', industry: 'energy', scope1: 450, ren: 65, paygap: 10 },
            { company_name: 'Enel', industry: 'energy', scope1: 380, ren: 58, paygap: 11 },
            { company_name: 'Accenture', industry: 'services', scope1: 85, ren: 72, paygap: 9 },
            { company_name: 'Deloitte', industry: 'services', scope1: 95, ren: 68, paygap: 10 },
            { company_name: 'PwC', industry: 'services', scope1: 90, ren: 65, paygap: 11 },
            { company_name: 'EY', industry: 'services', scope1: 88, ren: 62, paygap: 12 },
            { company_name: 'KPMG', industry: 'services', scope1: 92, ren: 60, paygap: 13 }
        ];
        for (const b of benchmarks) {
            await query(
                `INSERT INTO company_benchmarks (company_name, industry, scope1, ren, paygap)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (company_name, industry) DO NOTHING`,
                [b.company_name, b.industry, b.scope1, b.ren, b.paygap]
            );
        }
        console.log(`Created ${benchmarks.length} sample company benchmarks`);
    }
}

async function ensureSampleCompanies() {
    const count = await query('SELECT COUNT(*) AS n FROM companies');
    if (parseInt(count.rows[0].n, 10) === 0) {
        const companies = [
            { name: 'Skanska AB', industry: 'construction', esg_level: 'advanced' },
            { name: 'Essential Bouygues Construction', industry: 'construction', esg_level: 'intermediate' },
            { name: 'Hochtief Group', industry: 'construction', esg_level: 'intermediate' },
            { name: 'Budimex', industry: 'construction', esg_level: 'beginner' },
            { name: 'Vinci Construction', industry: 'construction', esg_level: 'intermediate' },
            { name: 'PayPal', industry: 'fintech', esg_level: 'advanced' },
            { name: 'Shopify', industry: 'fintech', esg_level: 'advanced' },
            { name: 'Stripe', industry: 'fintech', esg_level: 'advanced' },
            { name: 'Square', industry: 'fintech', esg_level: 'advanced' },
            { name: 'Adyen', industry: 'fintech', esg_level: 'intermediate' },
            { name: 'NVIDIA', industry: 'it', esg_level: 'intermediate' },
            { name: 'Microsoft', industry: 'it', esg_level: 'advanced' },
            { name: 'Apple', industry: 'it', esg_level: 'advanced' },
            { name: 'Google', industry: 'it', esg_level: 'advanced' },
            { name: 'Meta', industry: 'it', esg_level: 'intermediate' },
            { name: 'Amazon', industry: 'retail', esg_level: 'intermediate' },
            { name: 'IKEA', industry: 'retail', esg_level: 'advanced' },
            { name: 'Walmart', industry: 'retail', esg_level: 'beginner' },
            { name: 'Zara', industry: 'retail', esg_level: 'intermediate' },
            { name: 'H&M', industry: 'retail', esg_level: 'intermediate' },
            { name: 'Tesla', industry: 'manufacturing', esg_level: 'advanced' },
            { name: 'Volkswagen', industry: 'manufacturing', esg_level: 'beginner' },
            { name: 'Toyota', industry: 'manufacturing', esg_level: 'intermediate' },
            { name: 'Siemens', industry: 'manufacturing', esg_level: 'intermediate' },
            { name: 'General Electric', industry: 'manufacturing', esg_level: 'intermediate' },
            { name: 'DHL', industry: 'logistics', esg_level: 'intermediate' },
            { name: 'FedEx', industry: 'logistics', esg_level: 'intermediate' },
            { name: 'UPS', industry: 'logistics', esg_level: 'intermediate' },
            { name: 'DB Schenker', industry: 'logistics', esg_level: 'intermediate' },
            { name: 'Kuehne+Nagel', industry: 'logistics', esg_level: 'intermediate' },
            { name: 'Maersk', industry: 'transport', esg_level: 'intermediate' },
            { name: 'Delta Air Lines', industry: 'transport', esg_level: 'beginner' },
            { name: 'Lufthansa', industry: 'transport', esg_level: 'beginner' },
            { name: 'Ryanair', industry: 'transport', esg_level: 'beginner' },
            { name: 'Union Pacific', industry: 'transport', esg_level: 'beginner' },
            { name: 'Ørsted', industry: 'energy', esg_level: 'advanced' },
            { name: 'NextEra Energy', industry: 'energy', esg_level: 'advanced' },
            { name: 'Iberdrola', industry: 'energy', esg_level: 'advanced' },
            { name: 'EDF', industry: 'energy', esg_level: 'intermediate' },
            { name: 'Enel', industry: 'energy', esg_level: 'intermediate' },
            { name: 'Accenture', industry: 'services', esg_level: 'intermediate' },
            { name: 'Deloitte', industry: 'services', esg_level: 'intermediate' },
            { name: 'PwC', industry: 'services', esg_level: 'intermediate' },
            { name: 'EY', industry: 'services', esg_level: 'intermediate' },
            { name: 'KPMG', industry: 'services', esg_level: 'intermediate' }
        ];
        for (const c of companies) {
            await query(
                `INSERT INTO companies (name, industry, esg_level) VALUES ($1, $2, $3)`,
                [c.name, c.industry, c.esg_level]
            );
        }
        console.log(`Created ${companies.length} sample companies`);
    }
}

module.exports = {
    bootstrapDatabase,
    ensureAppUsersTable,
    ensureAdminUsersTable,
    ensureUserDataTable,
    ensureArticlesTable,
    ensureSurveyComparisonCompaniesTable,
    ensureCompanyBenchmarksTable,
    ensureCompaniesTable
};
