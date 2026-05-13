from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SessaoBase(BaseModel):
    tipo: str
    duracao_minutos: int
    distancia_km: float
    calorias_queimadas: float
    observacoes: Optional[str] = None

class SessaoCreate(SessaoBase):
    pass

class Sessao(SessaoBase):
    id: int
    usuario_id: int
    data_inicio: datetime
    data_fim: Optional[datetime] = None

    class Config:
        from_attributes = True

class UsuarioBase(BaseModel):
    email: str
    nome: str

class UsuarioCreate(UsuarioBase):
    senha: str

class Usuario(UsuarioBase):
    id: int
    data_criacao: datetime

    class Config:
        from_attributes = True
