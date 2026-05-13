# SweatTrack Backend

Backend da aplicação SweatTrack desenvolvido com FastAPI e MySQL.

## 🚀 Como começar

### 1. Pré-requisitos
- Python 3.10+
- MySQL Server rodando
- pip (gerenciador de pacotes Python)

### 2. Configurar variáveis de ambiente
Edite o arquivo `.env` com suas credenciais MySQL:

```
DATABASE_URL=mysql+mysql+connector://seu_usuario:sua_senha@localhost:3306/sweattrack
DEBUG=True
```

### 3. Instalar dependências
```bash
cd backend
pip install -r requirements.txt
```

### 4. Criar banco de dados
```sql
CREATE DATABASE sweattrack;
```

### 5. Executar o servidor
```bash
python main.py
```

Ou com Uvicorn diretamente:
```bash
uvicorn main:app --reload --port 8000
```

## 📚 Documentação da API

Após iniciar o servidor, acesse:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📁 Estrutura do projeto

```
backend/
├── main.py              # Arquivo principal da API
├── requirements.txt     # Dependências Python
├── .env                 # Variáveis de ambiente (não commitar!)
├── README.md            # Este arquivo
└── app/
    ├── __init__.py
    ├── database.py      # Configuração do banco de dados
    ├── models.py        # Modelos SQLAlchemy
    └── schemas.py       # Schemas Pydantic (validação)
```

## 🔧 Próximos passos

- [ ] Implementar autenticação (JWT)
- [ ] Adicionar mais endpoints conforme necessário
- [ ] Implementar testes unitários
- [ ] Adicionar logging
- [ ] Implementar CORS para o frontend
- [ ] Adicionar validações mais robustas

## 📝 Endpoints disponíveis

### Usuários
- `POST /usuarios/` - Criar novo usuário
- `GET /usuarios/{usuario_id}` - Obter dados do usuário

### Sessões
- `POST /sessoes/` - Criar nova sessão de treino
- `GET /sessoes/{usuario_id}` - Listar sessões do usuário
- `GET /sessoes/{sessao_id}` - Obter detalhes de uma sessão

### Health Check
- `GET /health` - Status da API
- `GET /` - Mensagem de boas-vindas

## 🤝 Dicas

1. A documentação automática (Swagger) é seu melhor amigo - use para testar endpoints
2. FastAPI valida dados automaticamente baseado nos schemas
3. O banco cria as tabelas automaticamente na primeira execução
