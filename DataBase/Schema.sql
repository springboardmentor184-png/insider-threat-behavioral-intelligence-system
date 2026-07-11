-- Table: roles
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- Table: users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INT REFERENCES roles(role_id) ON DELETE SET NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: login_activities
CREATE TABLE login_activities (
    activity_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    device_info VARCHAR(200),
    status VARCHAR(20) CHECK (status IN ('SUCCESS', 'FAILED'))
);
SELECT * FROM users;
SELECT * FROM login_activities;


ALTER TABLE login_activities
ADD COLUMN logout_time TIMESTAMP;


SELECT conname, conrelid::regclass AS table_name
FROM pg_constraint
WHERE conrelid = 'users'::regclass AND contype = 'u';

ALTER TABLE users DROP CONSTRAINT users_username_key;


ALTER SEQUENCE login_activities_activity_id_seq RESTART WITH 1;
ALTER SEQUENCE users_user_id_seq RESTART WITH 1;



ALTER TABLE login_activities
ADD COLUMN username VARCHAR(100);


ALTER TABLE users ADD COLUMN role_name VARCHAR(50);


UPDATE users SET role_name = 'Employee' WHERE role_name IS NULL;

ALTER TABLE users ALTER COLUMN role_name SET NOT NULL;
ALTER TABLE users DROP COLUMN role_id;

DELETE FROM login_activities;
DELETE FROM users;



