CREATE DATABASE IF NOT EXISTS sweattrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sweattrack;

-- Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    role ENUM('atleta', 'personal', 'treinador') NOT NULL DEFAULT 'atleta',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

);

-- Perfil de atleta
CREATE TABLE IF NOT EXISTS perfil_atleta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    genero ENUM ('male', 'female'),
    altura_cm DECIMAL(5,1),
    peso_kg DECIMAL (5,2),
    esporte VARCHAR(100),
    posicao VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Sessões
CREATE TABLE IF NOT EXISTS sessoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  sessao_tipo ENUM('treino','partida','recuperacao') DEFAULT 'treino',
  intensity ENUM('baixa','moderada','alta','variada') DEFAULT 'moderada',
  status ENUM('pre','active','completed') DEFAULT 'pre',
  
  -- Pré-sessão
  pre_peso_kg DECIMAL(5,2),
  cor_urina TINYINT COMMENT '1-8 WUTS scale',
  nivel_sede TINYINT COMMENT '0-10',
  temperatura_amb DECIMAL(4,1),
  umidade TINYINT,
  
  -- Monitoramento
  internal_temp DECIMAL(4,1),
  
  -- Pos-sessão
  pos_peso_kg DECIMAL(5,2),
  ingestao_total_ml INT DEFAULT 0,
  duracao_min INT,

  -- Calculo
  taxa_suor DECIMAL(4,2),
  deficit_hidrico_ml INT,
 
  -- Tempos/datas
  comecou_em TIMESTAMP NULL,
  terminou_em TIMESTAMP NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Ingestão de fluido durante a sessão
CREATE TABLE IF NOT EXISTS fluido_ingestao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sessao_id INT NOT NULL,
  quantidade_ml INT NOT NULL,
  conectado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessao_id) REFERENCES sessoes(id) ON DELETE CASCADE
);

-- Hidratação diária
CREATE TABLE IF NOT EXISTS hidratacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  data_hidrata DATE NOT NULL,
  total_fluido INT DEFAULT 0,
  index_hidratacao TINYINT COMMENT '0-100%',
  peso_kg DECIMAL(5,2),
  cor_urina TINYINT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (usuario_id, data_hidrata)
);

-- Notificações e alertas
CREATE TABLE IF NOT EXISTS notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  type ENUM('hidratacao','nutricao','recuperacao','alerta') DEFAULT 'hidratacao',
  titulo VARCHAR(200),
  message TEXT,
  lido TINYINT(1) DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);