-- Rodar: mysql -u root -p sweattrack < database/migration_admin.sql

USE sweattrack;

ALTER TABLE users ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE users MODIFY COLUMN role ENUM('athlete','nutritionist','coach','admin','doctor') DEFAULT 'athlete';

ALTER TABLE notifications
  MODIFY COLUMN type ENUM('hydration','nutrition','recovery','alert','admin_request') DEFAULT 'hydration';


ALTER TABLE notifications
  ADD COLUMN meta JSON NULL,
  ADD COLUMN action_taken TINYINT(1) NOT NULL DEFAULT 0;


INSERT IGNORE INTO users (name, email, password_hash, role, clinic_name, is_admin)
VALUES (
  'Admin SweatTrack',
  'admin@sweattrack.com',
  '$2b$10$L/6ZqTXVNoKd7MqBuSe49OLDBQjTULYDdI8T1LJyaebFiYCgrI0Ta',
  'admin',
  'SweatTrack',
  1
);


INSERT IGNORE INTO athlete_profiles (user_id)
SELECT id FROM users WHERE email = 'admin@sweattrack.com';
