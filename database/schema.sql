CREATE DATABASE IF NOT EXISTS insider_threat_db;

USE insider_threat_db;


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE,
    designation VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255),
    risk_score FLOAT DEFAULT 0
);

CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee VARCHAR(150),
    severity VARCHAR(30),
    description VARCHAR(255),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE user_behavior_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50),
    total_logons INT DEFAULT 0,
    after_hours_logons INT DEFAULT 0,
    unique_pcs_used INT DEFAULT 0,
    total_device_connects INT DEFAULT 0,
    unique_pcs_used_for_devices INT DEFAULT 0,
    risk_flag BOOLEAN DEFAULT FALSE,
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee VARCHAR(150),
    activity VARCHAR(255),
    device VARCHAR(100),
    ip_address VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);