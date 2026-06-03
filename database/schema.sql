-- Schema completo do SweatTrack
-- Rodar: mysql -u root -p < database/schema.sql
-- (Já inclui todas as migrações: admin, equipes e notificações)

CREATE DATABASE IF NOT EXISTS sweattrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sweattrack;

-- ─────────────────────────────────────────────
-- Usuários
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('athlete','nutritionist','coach','admin','doctor') NOT NULL DEFAULT 'athlete',
  is_admin      TINYINT(1) NOT NULL DEFAULT 0,
  clinic_name   VARCHAR(150),
  avatar_url    VARCHAR(500),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- Perfil do Atleta
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS athlete_profiles (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL UNIQUE,
  birth_date DATE,
  gender     ENUM('male','female','other'),
  height_cm  DECIMAL(5,1),
  weight_kg  DECIMAL(5,2),
  sport      VARCHAR(100),
  position   VARCHAR(100),
  vo2max     DECIMAL(5,1),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- Sessões de Treino
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  user_id              INT NOT NULL,
  session_type         ENUM('training','match','recovery') DEFAULT 'training',
  intensity            ENUM('baixa','moderada','alta','variada') DEFAULT 'moderada',
  status               ENUM('pre','active','completed') DEFAULT 'pre',
  -- Pré-Sessão
  pre_weight_kg        DECIMAL(5,2),
  urine_color          TINYINT COMMENT '1-8 escala WUTS',
  thirst_level         TINYINT COMMENT '0-10',
  ambient_temp         DECIMAL(4,1),
  humidity             TINYINT,
  -- Monitoramento
  internal_temp        DECIMAL(4,1),
  total_fluid_intake_ml INT DEFAULT 0,
  -- Pós-Sessão
  post_weight_kg       DECIMAL(5,2),
  duration_minutes     INT,
  -- Cálculos
  sweat_rate_lh        DECIMAL(4,2),
  hydric_deficit_ml    INT,
  symptoms             JSON NULL,
  ai_analysis          JSON NULL,
  -- Timestamps
  started_at           TIMESTAMP NULL,
  ended_at             TIMESTAMP NULL,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- Logs de Ingestão Hídrica
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fluid_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  amount_ml  INT NOT NULL,
  drink_type ENUM('water','isotonic','electrolyte','other') DEFAULT 'water',
  logged_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- Registros de Hidratação Diária
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hydration_records (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  record_date     DATE NOT NULL,
  total_fluid_ml  INT DEFAULT 0,
  hydration_index TINYINT COMMENT '0-100%',
  weight_kg       DECIMAL(5,2),
  urine_color     TINYINT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, record_date)
);

-- ─────────────────────────────────────────────
-- Notificações
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  type         ENUM('hydration','nutrition','recovery','alert','admin_request','team_invite','team_request') DEFAULT 'hydration',
  title        VARCHAR(200),
  message      TEXT,
  meta         JSON NULL,
  is_read      TINYINT(1) DEFAULT 0,
  action_taken TINYINT(1) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- Equipes
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  coach_id    INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- Membros de Equipes
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  team_id    INT NOT NULL,
  athlete_id INT NOT NULL,
  status     ENUM('invited','requested','accepted') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id)    REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (athlete_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_team_athlete (team_id, athlete_id)
);

-- ─────────────────────────────────────────────
-- Usuários de Demo / Seed
-- ─────────────────────────────────────────────

-- Usuário demo atleta (senha: demo1234)
INSERT IGNORE INTO users (name, email, password_hash, role)
VALUES (
  'Dr. Silva',
  'demo@sweattrack.com',
  '$2b$10$R.9DM6usOhPhXS3OzMcxL.aZFaz77JI7kMgy4JNOwArimNGapOcHC',
  'doctor'
);

-- Usuário admin (senha: admin1234)
INSERT IGNORE INTO users (name, email, password_hash, role, clinic_name, is_admin)
VALUES (
  'Admin SweatTrack',
  'admin@sweattrack.com',
  '$2b$10$L/6ZqTXVNoKd7MqBuSe49OLDBQjTULYDdI8T1LJyaebFiYCgrI0Ta',
  'admin',
  'SweatTrack',
  1
);

-- Perfis de atleta para os usuários seed
INSERT IGNORE INTO athlete_profiles (user_id)
SELECT id FROM users WHERE email IN ('demo@sweattrack.com', 'admin@sweattrack.com');
