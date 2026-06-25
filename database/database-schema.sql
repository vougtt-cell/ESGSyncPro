-- ESG Landing Page Database Schema

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    esg_level VARCHAR(20) CHECK (esg_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ESG reports table
CREATE TABLE IF NOT EXISTS esg_reports (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    esg_level VARCHAR(20) CHECK (esg_level IN ('beginner', 'intermediate', 'advanced')),
    content JSONB,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ESG metrics table
CREATE TABLE IF NOT EXISTS esg_metrics (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES esg_reports(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('environmental', 'social', 'governance')),
    metric_name VARCHAR(255) NOT NULL,
    value DECIMAL(10,2),
    unit VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User data table
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
);

-- App users (authorization for survey)
CREATE TABLE IF NOT EXISTS app_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);

-- Link user_data -> app_users (safe to re-run; column must exist first)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user_data' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE user_data ADD COLUMN user_id INTEGER;
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_user_data_user_id'
          AND table_name = 'user_data'
    ) THEN
        ALTER TABLE user_data
            ADD CONSTRAINT fk_user_data_user_id
            FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Admin users (login for admin panel)
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- AI requests table (for logging)
CREATE TABLE IF NOT EXISTS ai_requests (
    id SERIAL PRIMARY KEY,
    user_data_id INTEGER REFERENCES user_data(id) ON DELETE SET NULL,
    request_type VARCHAR(50) NOT NULL,
    prompt TEXT,
    response TEXT,
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company benchmarks table (for comparison data)
CREATE TABLE IF NOT EXISTS company_benchmarks (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    scope1 DECIMAL(15,3),  -- Emissions Scope 1 (tCO₂e)
    ren DECIMAL(5,2),     -- % energy from RES (0-100)
    paygap DECIMAL(5,2),  -- Pay Gap (%)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_name, industry)  -- One company can only be in one industry once
);

-- Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_esg_level ON companies(esg_level);
CREATE INDEX IF NOT EXISTS idx_esg_reports_company_id ON esg_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_esg_reports_status ON esg_reports(status);
CREATE INDEX IF NOT EXISTS idx_esg_metrics_report_id ON esg_metrics(report_id);
CREATE INDEX IF NOT EXISTS idx_esg_metrics_category ON esg_metrics(category);
CREATE INDEX IF NOT EXISTS idx_user_data_session_id ON user_data(session_id);
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_data_id ON ai_requests(user_data_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_company_benchmarks_industry ON company_benchmarks(industry);
CREATE INDEX IF NOT EXISTS idx_company_benchmarks_company_name ON company_benchmarks(company_name);

-- Survey comparison companies: list for the survey (managed in admin panel). company_benchmarks unchanged.
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
);
CREATE INDEX IF NOT EXISTS idx_survey_comparison_industry ON survey_comparison_companies(industry);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at (DROP IF EXISTS for idempotent schema runs)
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_esg_reports_updated_at ON esg_reports;
CREATE TRIGGER update_esg_reports_updated_at BEFORE UPDATE ON esg_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_data_updated_at ON user_data;
CREATE TRIGGER update_user_data_updated_at BEFORE UPDATE ON user_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_users_updated_at ON app_users;
CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON app_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_benchmarks_updated_at ON company_benchmarks;
CREATE TRIGGER update_company_benchmarks_updated_at BEFORE UPDATE ON company_benchmarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_survey_comparison_updated_at ON survey_comparison_companies;
CREATE TRIGGER update_survey_comparison_updated_at BEFORE UPDATE ON survey_comparison_companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ESG documents table (for uploaded documents in benchmark question 8)
CREATE TABLE IF NOT EXISTS esg_documents (
    id SERIAL PRIMARY KEY,
    document_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_by_session_id VARCHAR(255),
    benchmark_id INTEGER, -- Reference to benchmark/survey session
    esg_domains TEXT[], -- Array of domains: ['E', 'S', 'G']
    full_text TEXT,
    text_length INTEGER,
    tables_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ISO standards compliance results table
CREATE TABLE IF NOT EXISTS iso_compliance_results (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES esg_documents(id) ON DELETE CASCADE,
    benchmark_id INTEGER, -- Reference to benchmark/survey session
    standard_id VARCHAR(50) NOT NULL, -- ISO_14001, ISO_26000, ISO_37001
    standard_name VARCHAR(255),
    coverage_percent DECIMAL(5,2) DEFAULT 0,
    total_mandatory_requirements INTEGER DEFAULT 0,
    covered_mandatory_requirements INTEGER DEFAULT 0,
    applicable_standards TEXT[], -- Array of applicable standard IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ISO requirements compliance details table
CREATE TABLE IF NOT EXISTS iso_requirement_compliance (
    id SERIAL PRIMARY KEY,
    compliance_result_id INTEGER REFERENCES iso_compliance_results(id) ON DELETE CASCADE,
    requirement_id VARCHAR(100) NOT NULL, -- e.g., ISO_14001_6.1.2
    requirement_title TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('compliant', 'partial', 'non_compliant', 'not_found')),
    mandatory BOOLEAN DEFAULT true,
    text_fragments JSONB, -- Array of {text, context, position}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for ISO compliance tables
CREATE INDEX IF NOT EXISTS idx_esg_documents_benchmark_id ON esg_documents(benchmark_id);
CREATE INDEX IF NOT EXISTS idx_esg_documents_session_id ON esg_documents(uploaded_by_session_id);
CREATE INDEX IF NOT EXISTS idx_iso_compliance_results_document_id ON iso_compliance_results(document_id);
CREATE INDEX IF NOT EXISTS idx_iso_compliance_results_benchmark_id ON iso_compliance_results(benchmark_id);
CREATE INDEX IF NOT EXISTS idx_iso_compliance_results_standard_id ON iso_compliance_results(standard_id);
CREATE INDEX IF NOT EXISTS idx_iso_requirement_compliance_result_id ON iso_requirement_compliance(compliance_result_id);
CREATE INDEX IF NOT EXISTS idx_iso_requirement_compliance_requirement_id ON iso_requirement_compliance(requirement_id);
CREATE INDEX IF NOT EXISTS idx_iso_requirement_compliance_status ON iso_requirement_compliance(status);

-- Trigger for esg_documents updated_at
DROP TRIGGER IF EXISTS update_esg_documents_updated_at ON esg_documents;
CREATE TRIGGER update_esg_documents_updated_at BEFORE UPDATE ON esg_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for iso_compliance_results updated_at
DROP TRIGGER IF EXISTS update_iso_compliance_results_updated_at ON iso_compliance_results;
CREATE TRIGGER update_iso_compliance_results_updated_at BEFORE UPDATE ON iso_compliance_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Articles table (for landing page and admin panel)
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
);

CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);

