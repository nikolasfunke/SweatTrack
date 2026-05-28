-- rodar: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS sweattrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sweattrack;

-- Usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('athlete','coach','doctor') NOT NULL DEFAULT 'athlete',
  clinic_name VARCHAR(150),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Perfil ateta
CREATE TABLE IF NOT EXISTS athlete_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  birth_date DATE,
  gender ENUM('male','female','other'),
  height_cm DECIMAL(5,1),
  weight_kg DECIMAL(5,2),
  sport VARCHAR(100),
  position VARCHAR(100),
  vo2max DECIMAL(5,1),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- sessão
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_type ENUM('training','match','recovery') DEFAULT 'training',
  intensity ENUM('baixa','moderada','alta','variada') DEFAULT 'moderada',
  status ENUM('pre','active','completed') DEFAULT 'pre',
  -- info pre-sesssao
  pre_weight_kg DECIMAL(5,2),
  urine_color TINYINT COMMENT '1-8 WUTS scale',
  thirst_level TINYINT COMMENT '0-10',
  ambient_temp DECIMAL(4,1),
  humidity TINYINT,
  -- monitoramento
  internal_temp DECIMAL(4,1),
  -- info pos-sessao
  post_weight_kg DECIMAL(5,2),
  total_fluid_intake_ml INT DEFAULT 0,
  duration_minutes INT,
  --calculo
  sweat_rate_lh DECIMAL(4,2),
  hydric_deficit_ml INT,
  -- timestamp
  started_at TIMESTAMP NULL,
  ended_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fluid_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  amount_ml INT NOT NULL,
  drink_type ENUM('water','isotonic','electrolyte','other') DEFAULT 'water',
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hydration_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  record_date DATE NOT NULL,
  total_fluid_ml INT DEFAULT 0,
  hydration_index TINYINT COMMENT '0-100%',
  weight_kg DECIMAL(5,2),
  urine_color TINYINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, record_date)
);

-- nots
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('hydration','nutrition','recovery','alert') DEFAULT 'hydration',
  title VARCHAR(200),
  message TEXT,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- user demo (password: demo1234)
INSERT IGNORE INTO users (name, email, password_hash, role, clinic_name)
VALUES (
  'Dr. Silva',
  'demo@sweattrack.com',
  '$2b$10$R.9DM6usOhPhXS3OzMcxL.aZFaz77JI7kMgy4JNOwArimNGapOcHC',
  'doctor',
  'São Camilo'
);
