-- ============================================================
-- Data model for admin: survey comparison companies
-- MySQL / MariaDB (MySQL Workbench). 10 related tables.
-- Schema: esg_compare
-- Relationship graph:
--
--   industries
--      | 1:N
--      ├──► company_benchmarks
--      |         | 1:N
--      |         └──► survey_comparison_companies ◄──┐
--      | 1:N              | 1:N                      │ N:1
--      └──► survey_comparison_companies               │
--                    | N:1                           │
--                    └──► survey_export_records ──────┘
--                              | N:1
--                              └──► survey_export_log
-- ============================================================

CREATE SCHEMA IF NOT EXISTS esg_compare
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE esg_compare;

-- ==============================
-- 1. Administrators
-- ==============================
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================
-- 2. Industries lookup
-- ==============================
CREATE TABLE IF NOT EXISTS industries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_pl VARCHAR(255) NULL,
    name_en VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================
-- 3. ESG metric types lookup
-- ==============================
CREATE TABLE IF NOT EXISTS esg_metric_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_pl VARCHAR(255) NULL,
    unit VARCHAR(50) NULL,
    category ENUM('environmental','social','governance') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================
-- 4. Industry metric thresholds
-- Relations: industries 1:N, esg_metric_types 1:N
-- ==============================
CREATE TABLE IF NOT EXISTS industry_thresholds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    metric_type_id INT NOT NULL,
    threshold_low DECIMAL(15,3) NULL,
    threshold_medium DECIMAL(15,3) NULL,
    threshold_high DECIMAL(15,3) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_industry_metric (industry_id, metric_type_id),
    CONSTRAINT fk_threshold_industry
        FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_threshold_metric_type
        FOREIGN KEY (metric_type_id) REFERENCES esg_metric_types(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================
-- 5. Company benchmarks
-- Relations: industries 1:N
-- ==============================
CREATE TABLE IF NOT EXISTS company_benchmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    scope1 DECIMAL(15,3) NULL,
    ren DECIMAL(5,2) NULL,
    paygap DECIMAL(5,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_benchmark_industry_company (industry_id, company_name),
    CONSTRAINT fk_benchmarks_industry
        FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================
-- 6. Survey comparison companies (admin CRUD)
-- Relations: industries 1:N, company_benchmarks 1:N
-- ==============================
CREATE TABLE IF NOT EXISTS survey_comparison_companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    scope1 DECIMAL(15,3) NULL,
    ren DECIMAL(5,2) NULL,
    paygap DECIMAL(5,2) NULL,
    display_order INT DEFAULT 0,
    benchmark_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_survey_industry
        FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_survey_benchmark
        FOREIGN KEY (benchmark_id) REFERENCES company_benchmarks(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================
-- 7. Extended company metrics
-- Relations: survey_comparison_companies 1:N, esg_metric_types 1:N
-- ==============================
CREATE TABLE IF NOT EXISTS company_metric_values (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_company_id INT NOT NULL,
    metric_type_id INT NOT NULL,
    value DECIMAL(15,3) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_company_metric (survey_company_id, metric_type_id),
    CONSTRAINT fk_metric_val_company
        FOREIGN KEY (survey_company_id) REFERENCES survey_comparison_companies(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_metric_val_type
        FOREIGN KEY (metric_type_id) REFERENCES esg_metric_types(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================
-- 8. PDF export log
-- Relations: admin_users 1:N
-- ==============================
CREATE TABLE IF NOT EXISTS survey_export_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id INT NULL,
    exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    records_count INT NOT NULL DEFAULT 0,
    file_name VARCHAR(255) NULL,
    CONSTRAINT fk_export_admin
        FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================
-- 9. Export log rows
-- Relations: survey_export_log 1:N, survey_comparison_companies 1:N
-- ==============================
CREATE TABLE IF NOT EXISTS survey_export_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    export_log_id INT NOT NULL,
    survey_comparison_company_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_export_record_log
        FOREIGN KEY (export_log_id) REFERENCES survey_export_log(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_export_record_company
        FOREIGN KEY (survey_comparison_company_id) REFERENCES survey_comparison_companies(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================
-- 10. Admin action log
-- Relations: admin_users 1:N, survey_comparison_companies 1:N
-- ==============================
CREATE TABLE IF NOT EXISTS admin_action_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id INT NULL,
    action_type ENUM('create','update','delete','copy_benchmarks','export_pdf') NOT NULL,
    target_company_id INT NULL,
    details TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_action_admin
        FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_action_target
        FOREIGN KEY (target_company_id) REFERENCES survey_comparison_companies(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data (commented)
/*
INSERT INTO industries (code, name_pl, name_en) VALUES
('construction', 'Budownictwo', 'Construction'),
('energy', 'Energia', 'Energy'),
('fintech', 'Fintech', 'Fintech'),
('it', 'IT', 'IT'),
('retail', 'Handel detaliczny', 'Retail');

INSERT INTO esg_metric_types (code, name_en, name_pl, unit, category) VALUES
('scope1', 'Scope 1 emissions', 'Emisje Scope 1', 'tCO2e', 'environmental'),
('ren', 'Renewable energy share', 'Udział OZE', '%', 'environmental'),
('paygap', 'Gender pay gap', 'Luka płacowa', '%', 'social'),
('water', 'Water consumption', 'Zużycie wody', 'm3', 'environmental'),
('turnover', 'Employee turnover', 'Rotacja pracowników', '%', 'social');
*/
