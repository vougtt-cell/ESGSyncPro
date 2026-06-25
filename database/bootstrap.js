const { query } = require('./database');

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

async function bootstrapDatabase() {
    await ensureAppUsersTable();
    await ensureUserDataUserIdColumn();
    await ensureSurveyComparisonCompaniesTable();
    await ensureArticlesTable();
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

module.exports = {
    bootstrapDatabase,
    ensureArticlesTable,
    ensureSurveyComparisonCompaniesTable
};
