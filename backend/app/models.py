from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime
from app.database import Base

class Sessao(Base):
    __tablename__ = "sessoes"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, index=True)
    tipo = Column(String(50))  # Corrida, Caminhada, etc
    duracao_minutos = Column(Integer)
    distancia_km = Column(Float)
    calorias_queimadas = Column(Float)
    data_inicio = Column(DateTime, default=datetime.now)
    data_fim = Column(DateTime)
    observacoes = Column(String(500), nullable=True)

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    nome = Column(String(100))
    senha = Column(String(255))
    data_criacao = Column(DateTime, default=datetime.now)
