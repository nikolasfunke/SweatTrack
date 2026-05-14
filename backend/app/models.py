from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, Numeric, ForeignKey, func
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True)
    nome = Column(String(100))
    email = Column(String(100), unique=True)
    senha_hash = Column(String(255))
    role = Column(Enum('atleta', 'personal', 'treinador'), default='atleta')
    criado_em = Column(TIMESTAMP, server_default=func.now())
    atualizado_em = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class Sessao(Base):
    __tablename__ = "sessoes"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    sessao_tipo = Column(Enum('treino', 'partida', 'recuperacao'), default='treino')
    intensity = Column(Enum('baixa', 'moderada', 'alta', 'variada'), default='moderada')
    status = Column(Enum('pre', 'active', 'completed'), default='pre')
    pre_peso_kg = Column(Numeric(5, 2), nullable=True)
    pos_peso_kg = Column(Numeric(5, 2), nullable=True)
    duracao_min = Column(Integer, nullable=True)
    taxa_suor = Column(Numeric(4, 2), nullable=True)
    deficit_hidrico_ml = Column(Integer, nullable=True)
    comecou_em = Column(TIMESTAMP, nullable=True)
    terminou_em = Column(TIMESTAMP, nullable=True)
    criado_em = Column(TIMESTAMP, server_default=func.now())