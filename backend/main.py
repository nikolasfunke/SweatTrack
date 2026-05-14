from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.database import engine, get_db, Base
from app import models, schemas

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SweatTrack API", version="1.0.0")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ============ ROOT ============

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API SweatTrack!", "status": "online"}

# ============ USUÁRIOS ============

@app.post("/usuarios/", response_model=schemas.Usuario)
def criar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    email_existente = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if email_existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    db_usuario = models.Usuario(
        email=usuario.email,
        nome=usuario.nome,
        senha_hash=pwd_context.hash(usuario.senha),
        role=usuario.role
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

# ============ SESSÕES ============

@app.post("/sessoes/", response_model=schemas.Sessao)
def criar_sessao(sessao: schemas.SessaoCreate, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == sessao.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    db_sessao = models.Sessao(
        usuario_id=sessao.usuario_id,
        sessao_tipo=sessao.sessao_tipo,
        intensity=sessao.intensity,
        duracao_min=sessao.duracao_min,
        pre_peso_kg=sessao.pre_peso_kg,
        pos_peso_kg=sessao.pos_peso_kg,
    )
    db.add(db_sessao)
    db.commit()
    db.refresh(db_sessao)
    return db_sessao

@app.get("/usuarios/{usuario_id}/sessoes", response_model=list[schemas.Sessao])
def listar_sessoes_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return db.query(models.Sessao).filter(models.Sessao.usuario_id == usuario_id).all()

@app.get("/sessoes/{sessao_id}", response_model=schemas.Sessao)
def obter_sessao(sessao_id: int, db: Session = Depends(get_db)):
    sessao = db.query(models.Sessao).filter(models.Sessao.id == sessao_id).first()
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    return sessao

@app.patch("/sessoes/{sessao_id}/finalizar", response_model=schemas.Sessao)
def finalizar_sessao(sessao_id: int, db: Session = Depends(get_db)):
    sessao = db.query(models.Sessao).filter(models.Sessao.id == sessao_id).first()
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    sessao.status = "completed"
    db.commit()
    db.refresh(sessao)
    return sessao

# ============ HEALTH CHECK ============

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)