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
  ('EMP007', 'Siti Mariam Abdullah', 'siti.mariam@company.my', 'HR', 'Recruitment Specialist', '2024-02-12', 4700.00, TRUE);
