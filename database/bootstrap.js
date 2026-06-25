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

async function bootstrapDatabase() {
    await ensureAppUsersTable();
    await ensureAdminUsersTable();
    await ensureUserDataTable();
    await ensureUserDataUserIdColumn();
    await ensureSurveyComparisonCompaniesTable();
    await ensureArticlesTable();
    await ensureDefaultAdmin();
    await ensureDefaultAppUser();
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

module.exports = {
    bootstrapDatabase,
    ensureAppUsersTable,
    ensureAdminUsersTable,
    ensureUserDataTable,
    ensureArticlesTable,
    ensureSurveyComparisonCompaniesTable
};
