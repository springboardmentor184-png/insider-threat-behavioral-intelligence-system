-- Insider Threat Behavioral Intelligence System
-- Database Schema Design (PostgreSQL)

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (System Users: Admins, Security Managers, SOC Engineers, Analysts)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Employees Table (Monitored entities)
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL, -- External corporate identifier (e.g., EMP-10293)
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    designation VARCHAR(100) NOT NULL,
    manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL, -- Self-referential FK for reporting manager
    access_privileges TEXT NOT NULL, -- Comma-separated list or JSON representing permissions (e.g., "DB_WRITE, VPN_ACCESS")
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Devices Table (Assigned assets to employees)
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL, -- Asset Tag / Serial Number
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- e.g., Laptop, Desktop, Mobile, Server
    ip_address VARCHAR(45), -- Supports IPv4 and IPv6
    mac_address VARCHAR(17),
    employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Active' NOT NULL, -- Active, Inactive, Decommissioned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Activity Logs Table (Monitored events)
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- Login, File Access, File Upload, File Download, USB Usage, Network Activity, Email Activity
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    severity VARCHAR(20) DEFAULT 'Low' NOT NULL, -- Low, Medium, High, Critical
    details JSONB NOT NULL, -- Dynamic event details (e.g., file path, destination IP, file size)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Query Optimization
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_employees_emp_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_devices_dev_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_employee ON activity_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_severity ON activity_logs(severity);

-- Seed Initial Roles (Milestone 1 requirement)
INSERT INTO roles (name, description) VALUES
('Administrator', 'Full system control, employee management, and configuration capability.'),
('Security Manager', 'Organizational risk oversight, reporting, and policy monitoring.'),
('SOC Engineer', 'Monitors network logs, ingests telemetry, and manages investigations.'),
('Security Analyst', 'Performs investigative research, filters anomalies, and analyzes log profiles.')
ON CONFLICT (name) DO NOTHING;

-- Seed Default Departments for Demo / Mock data setup
INSERT INTO departments (name, description) VALUES
('Information Technology', 'Manages hardware, software, network configurations, and database endpoints.'),
('Engineering', 'Develops product lines, codebase repositories, and service backends.'),
('Finance', 'Processes corporate transactions, invoices, and bank integrations.'),
('Human Resources', 'Oversees employee relations, onboarding, and internal corporate compliance.')
ON CONFLICT (name) DO NOTHING;
