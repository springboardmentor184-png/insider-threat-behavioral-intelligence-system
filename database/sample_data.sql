USE insider_threat_db;


INSERT INTO users
(full_name,email,password,role,department)
VALUES
('John Doe','john@example.com','123456','Security Analyst','SOC'),
('Alice Smith','alice@example.com','123456','Administrator','IT'),
('David Kumar','david@example.com','123456','SOC Engineer','Security');

INSERT INTO user_profiles
(employee_id,designation,phone,address,risk_score)
VALUES
('EMP001','Security Analyst','9876543210','Madurai',25),
('EMP002','Administrator','9876543211','Chennai',10),
('EMP003','SOC Engineer','9876543212','Coimbatore',60);

INSERT INTO alerts
(employee,severity,description,status)
VALUES
('John Doe','High','Multiple Failed Login Attempts','Open'),
('David Kumar','Medium','USB Device Connected','Investigating'),
('Alice Smith','Low','Password Changed','Closed');

INSERT INTO activity_logs
(employee,activity,device,ip_address)
VALUES
('John Doe','Login','Laptop','192.168.1.10'),
('Alice Smith','Downloaded Confidential File','Desktop','192.168.1.15'),
('David Kumar','Inserted USB Device','Office PC','192.168.1.20');