DROP DATABASE IF EXISTS employee_directory;
CREATE DATABASE employee_directory;
USE employee_directory;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empId VARCHAR(8) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  department VARCHAR(40) NOT NULL,
  position VARCHAR(100) NOT NULL,
  hireDate DATE NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO employees
  (empId, name, email, department, position, hireDate, salary, active)
VALUES
  ('EMP001', 'Aina Sofia Rahman', 'aina.rahman@company.my', 'HR', 'HR Executive', '2021-03-15', 4200.00, TRUE),
  ('EMP002', 'Daniel Lim Wei Jian', 'daniel.lim@company.my', 'IT', 'Systems Analyst', '2020-08-01', 6800.00, TRUE),
  ('EMP003', 'Nur Izzati Hassan', 'izzati.hassan@company.my', 'Finance', 'Accountant', '2019-11-20', 5900.00, TRUE),
  ('EMP004', 'Raj Kumar Menon', 'raj.menon@company.my', 'Operations', 'Operations Supervisor', '2018-05-10', 7200.00, FALSE),
  ('EMP005', 'Mei Ling Tan', 'mei.tan@company.my', 'Marketing', 'Digital Marketing Lead', '2022-01-17', 6300.00, TRUE),
  ('EMP006', 'Farid Iskandar', 'farid.iskandar@company.my', 'IT', 'Frontend Developer', '2023-06-05', 5100.00, TRUE),
  ('EMP007', 'Siti Mariam Abdullah', 'siti.mariam@company.my', 'HR', 'Recruitment Specialist', '2024-02-12', 4700.00, TRUE),
  ('EMP008', 'Jason Wong Kai Ming', 'jason.wong@company.my', 'Finance', 'Finance Manager', '2017-09-04', 9800.00, TRUE),
  ('EMP009', 'Nadia Azmi', 'nadia.azmi@company.my', 'Operations', 'Logistics Coordinator', '2021-07-26', 4300.00, TRUE),
  ('EMP010', 'Chong Pei Shan', 'pei.chong@company.my', 'Marketing', 'Content Strategist', '2020-02-18', 5600.00, TRUE),
  ('EMP011', 'Amirul Hakim', 'amirul.hakim@company.my', 'IT', 'Database Administrator', '2019-04-08', 7600.00, TRUE),
  ('EMP012', 'Priya Nair', 'priya.nair@company.my', 'HR', 'Payroll Officer', '2022-09-19', 4500.00, TRUE),
  ('EMP013', 'Low Zheng Hao', 'zheng.low@company.my', 'Operations', 'Warehouse Lead', '2016-12-12', 6100.00, FALSE),
  ('EMP014', 'Hana Balqis Yusof', 'hana.yusof@company.my', 'Finance', 'Accounts Executive', '2023-03-01', 3900.00, TRUE),
  ('EMP015', 'Marcus Lee Jun Kit', 'marcus.lee@company.my', 'Marketing', 'Brand Executive', '2024-05-06', 4100.00, TRUE),
  ('EMP016', 'Liyana Mokhtar', 'liyana.mokhtar@company.my', 'IT', 'Product Designer', '2021-10-11', 6400.00, TRUE),
  ('EMP017', 'Goh Wen Jie', 'wenjie.goh@company.my', 'Operations', 'Procurement Executive', '2020-06-22', 5200.00, TRUE),
  ('EMP018', 'Sarah Tan Hui Min', 'sarah.tan@company.my', 'HR', 'Learning Coordinator', '2018-01-29', 5000.00, TRUE),
  ('EMP019', 'Imran Zulkifli', 'imran.zulkifli@company.my', 'IT', 'DevOps Engineer', '2022-11-14', 8200.00, TRUE),
  ('EMP020', 'Rebecca Ong', 'rebecca.ong@company.my', 'Finance', 'Internal Auditor', '2019-08-05', 7000.00, TRUE),
  ('EMP021', 'Harith Danish', 'harith.danish@company.my', 'Operations', 'Facilities Officer', '2023-12-04', 3600.00, TRUE);
