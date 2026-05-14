from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# ============ USUÁRIO ============

class UsuarioBase(BaseModel):
    email: str
    nome: str
    role: str = 'atleta'

class UsuarioCreate(UsuarioBase):
    senha: str

class Usuario(UsuarioBase):
    id: int
    criado_em: datetime

    class Config:
        from_attributes = True

# ============ SESSÃO ============

class SessaoBase(BaseModel):
    sessao_tipo: str = 'treino'
    intensity: str = 'moderada'
    duracao_min: Optional[int] = None
    pre_peso_kg: Optional[float] = None
    pos_peso_kg: Optional[float] = None

class SessaoCreate(SessaoBase):
    usuario_id: int

class Sessao(SessaoBase):
    id: int
    usuario_id: int
    status: str
    taxa_suor: Optional[float] = None
    deficit_hidrico_ml: Optional[int] = None
    comecou_em: Optional[datetime] = None
    terminou_em: Optional[datetime] = None
    criado_em: datetime

    class Config:
        from_attributes = True