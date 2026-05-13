from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import engine, get_db, Base
from app import models, schemas

# Criar as tabelas no banco
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SweatTrack API", version="1.0.0")

# ============ ENDPOINTS EXEMPLO ============

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API SweatTrack!", "status": "online"}

# USUÁRIOS
@app.post("/usuarios/", response_model=schemas.Usuario)
def criar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    # TODO: Hash da senha aqui depois
    db_usuario = models.Usuario(
        email=usuario.email,
        nome=usuario.nome,
        senha=usuario.senha
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@app.get("/usuarios/{usuario_id}", response_model=schemas.Usuario)
def obter_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario

# SESSÕES
@app.post("/sessoes/", response_model=schemas.Sessao)
def criar_sessao(sessao: schemas.SessaoCreate, usuario_id: int, db: Session = Depends(get_db)):
    db_sessao = models.Sessao(
        usuario_id=usuario_id,
        tipo=sessao.tipo,
        duracao_minutos=sessao.duracao_minutos,
        distancia_km=sessao.distancia_km,
        calorias_queimadas=sessao.calorias_queimadas,
        observacoes=sessao.observacoes
    )
    db.add(db_sessao)
    db.commit()
    db.refresh(db_sessao)
    return db_sessao

@app.get("/sessoes/{usuario_id}", response_model=list[schemas.Sessao])
def listar_sessoes_usuario(usuario_id: int, db: Session = Depends(get_db)):
    sessoes = db.query(models.Sessao).filter(models.Sessao.usuario_id == usuario_id).all()
    return sessoes

@app.get("/sessoes/{sessao_id}", response_model=schemas.Sessao)
def obter_sessao(sessao_id: int, db: Session = Depends(get_db)):
    sessao = db.query(models.Sessao).filter(models.Sessao.id == sessao_id).first()
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    return sessao

# ============ HEALTH CHECK ============
@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
