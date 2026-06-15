# 💧 SweatTrack

> **Projeto Integrador — Centro Universitário São Camilo**
> Sistema web de monitoramento de hidratação e desempenho atlético com suporte a IA.

## Sobre o Projeto

O **SweatTrack** é uma plataforma web completa voltada para atletas, treinadores, nutricionistas e médicos esportivos. O sistema permite o rastreamento em tempo real da hidratação durante sessões de treino, cálculo automático do déficit hídrico e taxa de sudorese, análise analítica de histórico de desempenho e geração de laudos personalizados via inteligência artificial (Google Gemini).

A aplicação foi desenvolvida como **Projeto Integrador (PI)** para o Centro Universitário São Camilo, seguindo uma arquitetura desacoplada (SPA + REST API) com banco de dados relacional.

---

## Funcionalidades

### Para Atletas
- **Pré-Sessão**: registro de peso corporal, cor da urina (escala WUTS 1–8), nível de sede, temperatura ambiente e umidade antes do treino
- **Monitoramento Ativo**: log de ingestão hídrica em tempo real (água, isotônico, eletrólitos), temperatura interna e cronômetro de sessão
- **Pós-Sessão**: registro do peso pós-treino, cálculo automático do déficit hídrico em ml, taxa de sudorese (L/h) e análise de sintomas
- **Análise com IA**: laudo personalizado gerado pelo Google Gemini com base nos dados da sessão
- **Dashboard**: resumo de hidratação, score semanal, histórico de sessões e progresso
- **Histórico**: visualização de todas as sessões passadas com filtros
- **Analytics**: gráficos interativos de evolução de hidratação, peso e desempenho ao longo do tempo
- **Notificações**: sistema de alertas de hidratação, convites de equipe e comunicados

### Para Treinadores
- **Equipes**: criação e gestão de equipes, convite de atletas, visualização do status de hidratação de cada membro
- **Monitor**: visão consolidada em tempo real da hidratação de todos os atletas da equipe durante sessões ativas
- **Acesso aos dados de sessão** de cada atleta vinculado
---

## Stack Tecnológica

### Frontend

| Tecnologia | Versão | Função |
|---|---|---|
| **React** | 18.3.1 | Biblioteca principal de UI, componentização e estado local |
| **Vite** | 5.2.6 | Bundler moderno e servidor de desenvolvimento com HMR ultrarrápido |
| **React Router DOM** | 6.22.3 | Roteamento client-side com suporte a rotas protegidas (guards) |
| **Tailwind CSS** | 3.4.3 | Framework CSS utilitário para estilização rápida e responsiva |
| **Framer Motion** | 11.1.7 | Animações declarativas de página e componentes (fade, slide, etc.) |
| **Recharts** | 2.12.3 | Biblioteca de gráficos baseada em D3 — usada na página de Analytics |
| **Axios** | 1.6.8 | Cliente HTTP para comunicação com a API REST do backend |
| **Lucide React** | 0.368.0 | Biblioteca de ícones SVG modernos e consistentes |
| **React Markdown** | 10.1.0 | Renderização de markdown — utilizado para exibir laudos gerados pela IA |
| **PostCSS / Autoprefixer** | — | Processamento e compatibilidade do CSS gerado pelo Tailwind |

**Destaques da arquitetura frontend:**
- **Lazy Loading**: todas as páginas são carregadas de forma assíncrona com `React.lazy()` + `Suspense`, reduzindo o bundle inicial
- **Context API**: `AuthContext` (estado global de autenticação) e `ThemeContext` (tema claro/escuro)
- **Route Guards**: componentes `RequireAuth`, `RequireAdmin`, `RequireUnverified` e `RedirectIfAuth` protegem as rotas conforme o perfil do usuário
- **AnimatePresence**: transições suaves entre páginas com o Framer Motion

---

### Backend

| Tecnologia | Versão | Função |
|---|---|---|
| **Node.js** | ≥ 18 | Ambiente de execução JavaScript server-side |
| **Express** | 4.18.3 | Framework web minimalista para criação da API REST |
| **mysql2** | 3.9.2 | Driver MySQL com suporte a Promises e prepared statements |
| **jsonwebtoken (JWT)** | 9.0.2 | Geração e validação de tokens de autenticação stateless |
| **bcrypt** | 5.1.1 | Hash seguro de senhas com salt automático (custo 12) |
| **express-validator** | 7.1.0 | Validação e sanitização de entradas da API (body validation) |
| **express-rate-limit** | 8.5.2 | Rate limiting nas rotas de autenticação (20 req / 15 min) |
| **nodemailer** | 8.0.10 | Envio de e-mails transacionais (verificação de conta via SMTP) |
| **@google/genai** | 2.7.0 | SDK oficial do Google Gemini para geração de laudos com IA |
| **compression** | 1.8.1 | Middleware de compressão gzip das respostas HTTP |
| **cors** | 2.8.5 | Configuração de Cross-Origin Resource Sharing |
| **dotenv** | 16.4.5 | Carregamento de variáveis de ambiente do arquivo `.env` |
| **nodemon** | 3.1.0 | Reinicialização automática do servidor em desenvolvimento |

**Destaques da arquitetura backend:**
- **MVC**: separação clara entre rotas (`routes/`), controladores (`controllers/`) e acesso ao banco (`config/database.js`)
- **Middlewares customizados**: `auth.js` (JWT), `requireAdmin.js`, `coachAccess.js` e `verified.js`
- **Pool de conexões MySQL**: gerenciado via `mysql2/promise` para eficiência e reuso de conexões
- **Error handling centralizado**: handler global de erros e respostas padronizadas

---

### Banco de Dados

| Tecnologia | Função |
|---|---|
| **MySQL** | Banco de dados relacional principal |
| **Railway** (cloud) | Hospedagem do banco em produção via proxy TCP |
| **utf8mb4** | Charset para suporte a emojis e caracteres especiais |
---

## API — Rotas e Endpoints

Base URL: `http://localhost:3001/api`

### Auth (`/api/auth`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/register` | Cadastro de novo usuário | ❌ |
| POST | `/login` | Login e geração de JWT | ❌ |
| GET | `/me` | Dados do usuário autenticado | ✅ JWT |
| POST | `/verify-email` | Verificação de e-mail com código OTP | ✅ JWT |
| POST | `/resend-verification` | Reenvio do código de verificação | ✅ JWT |

### Sessions (`/api/sessions`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/` | Criar nova sessão | ✅ |
| GET | `/` | Listar sessões do usuário | ✅ |
| GET | `/:id` | Detalhes de uma sessão | ✅ |
| PATCH | `/:id/pre` | Preencher dados pré-sessão | ✅ |
| PATCH | `/:id/start` | Iniciar monitoramento ativo | ✅ |
| POST | `/:id/fluid-log` | Registrar ingestão hídrica | ✅ |
| PATCH | `/:id/complete` | Finalizar sessão e calcular métricas | ✅ |
| POST | `/:id/ai-analysis` | Gerar laudo com Google Gemini | ✅ |

### Users (`/api/users`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| PATCH | `/profile` | Atualizar perfil do atleta | ✅ |
| GET | `/notifications` | Listar notificações | ✅ |
| PATCH | `/notifications/:id/read` | Marcar notificação como lida | ✅ |

### Analytics (`/api/analytics`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/summary` | Resumo de hidratação e métricas | ✅ |
| GET | `/history` | Histórico detalhado para gráficos | ✅ |

### Teams (`/api/teams`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/` | Listar equipes do usuário | ✅ |
| POST | `/` | Criar nova equipe (coach) | ✅ Coach |
| POST | `/:id/invite` | Convidar atleta | ✅ Coach |
| POST | `/:id/request` | Atleta solicitar entrada | ✅ |
| PATCH | `/:id/accept/:memberId` | Aceitar membro | ✅ Coach |
| DELETE | `/:id/members/:athleteId` | Remover membro da equipe | ✅ Coach |

### Admin (`/api/admin`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/users` | Listar todos os usuários | ✅ Admin |
| PATCH | `/users/:id/toggle-admin` | Promover/revogar admin | ✅ Admin |
| DELETE | `/users/:id` | Excluir usuário | ✅ Admin |

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** ≥ 18.x — [download](https://nodejs.org/)
- **npm** ≥ 9.x (vem junto com o Node)
- **MySQL** ≥ 8.x — [download](https://dev.mysql.com/downloads/) ou use o Docker
- **Git** — para clonar o repositório

---

## Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/nikolasfunke/SweatTrack.git
cd SweatTrack
```

### 2. Configure o backend

```bash
cd backend
cp .env.example .env   # ou edite o .env manualmente
npm install
```

Edite o arquivo `backend/.env` com suas credenciais (veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente)).

### 3. Configure o frontend

```bash
cd ../frontend
npm install
```

---

## Rodando o Projeto

### Backend (API)

```bash
cd backend
npm run dev      # Desenvolvimento com nodemon (hot-reload)
# ou
npm start        # Produção
```

A API estará disponível em: `http://localhost:3001`
Endpoint de saúde: `http://localhost:3001/health`

### Frontend (SPA React)

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

> Mantenha **ambos os servidores rodando** simultaneamente em terminais separados.


## Estrutura de Pastas

```
SweatTrack/
│
├── backend/
│   ├── server.js                    # App Express: middlewares, rotas, error handler
│   ├── .env                         # Variáveis de ambiente (não versionar)
│   ├── package.json
│   └── src/
│       ├── config/
│       │   ├── database.js          # Pool de conexões mysql2/promise
│       │   └── email.js             # Configuração Nodemailer (SMTP)
│       ├── controllers/
│       │   ├── authController.js    # Registro, login, verificação de e-mail
│       │   ├── sessionController.js # CRUD de sessões, logs, cálculos, IA
│       │   ├── userController.js    # Perfil e notificações
│       │   ├── analyticsController.js # Métricas e gráficos
│       │   ├── teamController.js    # CRUD de equipes e membros
│       │   └── adminController.js   # Gestão de usuários (admin only)
│       ├── middleware/
│       │   ├── auth.js              # Verifica JWT e injeta req.userId
│       │   ├── requireAdmin.js      # Bloqueia rotas para não-admins
│       │   ├── coachAccess.js       # Permite acesso a coaches com equipes
│       │   └── verified.js          # Exige e-mail verificado
│       └── routes/
│           ├── auth.js
│           ├── sessions.js
│           ├── users.js
│           ├── analytics.js
│           ├── teams.js
│           └── admin.js
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js               # Proxy /api → backend:3001
│   ├── tailwind.config.js           # Tema customizado (cores, fontes, animações)
│   ├── postcss.config.js
│   └── src/
│       ├── App.jsx                  # Roteamento + guards de rota
│       ├── main.jsx                 # ReactDOM.createRoot + Providers
│       ├── index.css                # Estilos globais e variáveis CSS
│       ├── contexts/
│       │   ├── AuthContext.jsx      # Estado global: user, login(), logout()
│       │   └── ThemeContext.jsx     # Tema claro/escuro persistido em localStorage
│       ├── services/
│       │   └── api.js               # Axios com baseURL + interceptor de token JWT
│       ├── components/
│       │   ├── layout/              # Sidebar, Navbar, Layout wrapper
│       │   ├── ui/                  # Spinner, Modal, Badge, Button etc.
│       │   ├── charts/              # Componentes Recharts reutilizáveis
│       │   └── session/             # Componentes específicos de sessão
│       ├── pages/
│       │   ├── Landing.jsx          # Página inicial pública
│       │   ├── Login.jsx            # Autenticação
│       │   ├── Register.jsx         # Cadastro (athlete ou coach)
│       │   ├── VerifyEmail.jsx      # Verificação de e-mail por OTP
│       │   ├── Dashboard.jsx        # Painel principal do usuário
│       │   ├── PreSession.jsx       # Formulário pré-treino
│       │   ├── ActiveMonitoring.jsx # Monitoramento em tempo real
│       │   ├── PostSession.jsx      # Dados pós-treino + laudo IA
│       │   ├── Analytics.jsx        # Gráficos de evolução (Recharts)
│       │   ├── History.jsx          # Histórico de sessões
│       │   ├── Monitor.jsx          # Monitor de equipe (coach)
│       │   ├── Notifications.jsx    # Central de notificações
│       │   ├── Teams.jsx            # Gestão de equipes
│       │   ├── Profile.jsx          # Perfil e dados biométricos
│       │   ├── Settings.jsx         # Configurações do usuário
│       │   └── AdminUsers.jsx       # Painel admin de usuários
│       └── utils/                   # Helpers de formatação, cálculos etc.
│
├── database/
│   └── schema.sql                   # DDL completo + seed de usuários demo
│
├── docs/
│   └── testes_evidencia.md          # Evidências de testes realizados
│
└── README.md
```

O sistema de permissões é implementado em dois níveis:
1. **Backend** — middlewares `requireAdmin` e `coachAccess` bloqueiam rotas antes de atingir os controllers
2. **Frontend** — `RequireAuth` e `RequireAdmin` redirecionam rotas não autorizadas no React Router

---

## Integração com IA (Google Gemini)

O SweatTrack usa o **Google Gemini** (`@google/genai` SDK) para gerar laudos personalizados de hidratação após cada sessão de treino.

### Como funciona

1. O atleta completa uma sessão (pré + monitoramento + pós)
2. Na página de Pós-Sessão, aciona a análise por IA
3. O frontend envia `POST /api/sessions/:id/ai-analysis`
4. O backend monta um prompt estruturado com todos os dados da sessão (peso, taxa de sudorese, déficit hídrico, sintomas, temperatura, etc.)
5. O Gemini retorna um laudo em markdown com observações clínicas e recomendações
6. O laudo é salvo no campo `ai_analysis` (JSON) da tabela `sessions`
7. O frontend renderiza o markdown com **React Markdown**

### Configuração

Obtenha uma chave de API gratuita em [Google AI Studio](https://aistudio.google.com/app/apikey) e defina em `backend/.env`:

```env
GEMINI_API_KEY=sua_chave_aqui
```

---

## Segurança

O projeto implementa diversas camadas de segurança:

- **Hashing de senhas**: bcrypt com fator de custo 12 (resistente a ataques de força bruta)
- **JWT stateless**: tokens com expiração configurável (padrão 7 dias), validados em cada request protegido
- **Rate Limiting**: rotas `/auth/login` e `/auth/register` limitadas a 20 requisições por 15 minutos por IP
- **Validação de entrada**: express-validator sanitiza e valida todos os campos de entrada antes de processar
- **CORS configurado**: apenas a origem `CLIENT_URL` é permitida
- **Compressão de respostas**: gzip habilitado para reduzir tráfego
- **Verificação de e-mail**: código OTP de 6 dígitos com validade de 15 minutos — usuário não acessa o sistema sem verificar o e-mail
- **Prepared statements**: todas as queries usam `?` placeholders do mysql2, prevenindo SQL Injection
- **Variáveis de ambiente**: segredos nunca hardcoded no código (`.env` no `.gitignore`)

---

## Cálculo dos Índices

Esta seção documenta **todas as métricas e índices** calculados e exibidos no SweatTrack, com suas fórmulas exatas, origem no código e interpretação clínica.

---

### 1. Taxa de Sudorese (Sweat Rate)

> **Onde aparece:** Pós-Sessão, Dashboard, Analytics, Monitor de Equipe

**Fórmula:**

```
PerdaSuorTotal (L) = (PesoAntes_kg - PesoDepois_kg) + IngestãoTotal_L

TaxaSudorese (L/h) = PerdaSuorTotal / (DuraçãoSessão_min / 60)
```

**Implementação no backend** ([`sessionController.js`](backend/src/controllers/sessionController.js), linha 3–15):

```js
const weightLossKg     = preWeight - postWeight;
const fluidIntakeLiters = (fluidIntakeMl || 0) / 1000;
const totalSweatLiters  = weightLossKg + fluidIntakeLiters;
const sweatRateLh       = totalSweatLiters / (durationMin / 60);
```

**Interpretação clínica** (função `getSweatRateLabel` em [`calculations.js`](frontend/src/utils/calculations.js)):

| Faixa (L/h) | Classificação | Cor de exibição |
|---|---|---|
| < 0,5 | Baixa | Verde esmeralda |
| 0,5 – 0,99 | Moderada | Verde limão |
| 1,0 – 1,49 | Alta | Âmbar |
| 1,5 – 1,99 | Muito Alta | Laranja |
| ≥ 2,0 | Extrema | Vermelho |

> ⚠️ O sistema exibe um aviso de validação se a taxa calculada previamente ultrapassar **3,0 L/h** (limite fisiológico extremo), orientando o atleta a confirmar os dados de pesagem.

---

### 2. Déficit Hídrico

> **Onde aparece:** Pós-Sessão, Monitor de Equipe, Monitoramento Ativo (estimativa)

**Fórmula:**

```
Déficit (ml) = (PesoAntes_kg - PesoDepois_kg) × 1000
```

O déficit representa a diferença de massa corporal convertida diretamente para mililitros de fluido perdido (1 kg ≈ 1 L de água).

**Implementação no backend** ([`sessionController.js`](backend/src/controllers/sessionController.js), linha 9):

```js
const hydricDeficitMl = Math.round(weightLossKg * 1000);
```

**Implementação no frontend** ([`calculations.js`](frontend/src/utils/calculations.js), linha 34):

```js
export function calcHydricDeficit(preWeight, postWeight) {
  return Math.round((preWeight - postWeight) * 1000);
}
```

**Classificação exibida** (em [`PostSession.jsx`](frontend/src/pages/PostSession.jsx), linha 178):

| Déficit | Status |
|---|---|
| ≤ 2.000 ml | ✅ Dentro do esperado |
| > 2.000 ml | 🔴 Elevado |

---

### 3. Índice de Hidratação

> **Onde aparece:** Dashboard (medidor circular / gauge), Analytics

Derivado da cor da urina (escala WUTS — a última registrada em qualquer sessão).

**Fórmula:**

```
ÍndiceHidratação = clamp(100 - (CorUrina - 1) × 12, mín=20, máx=100)
```

**Implementação no backend** ([`analyticsController.js`](backend/src/controllers/analyticsController.js), linha 49–51):

```js
const hydrationIndex = Math.max(20, Math.min(100,
  Math.round(100 - (lastHydration[0].urine_color - 1) * 12)
));
```

**Mapeamento da escala WUTS → Índice de Hidratação:**

| Cor da Urina (WUTS) | Descrição | Índice calculado |
|---|---|---|
| 1 | Muito pálida (ótima hidratação) | 100% |
| 2 | Pálida | 88% |
| 3 | Amarelo claro | 76% |
| 4 | Amarelo médio | 64% |
| 5 | Amarelo escuro | 52% |
| 6 | Âmbar | 40% |
| 7 | Laranja (desidratação grave) | 28% |
| 8 | Marrom (desidratação crítica) | 20% (mínimo fixo) |

**Interpretação do índice** (função `getHydrationStatus` em [`calculations.js`](frontend/src/utils/calculations.js)):

| Faixa (%) | Status | Cor |
|---|---|---|
| ≥ 90 | Ótimo | Verde esmeralda |
| 75 – 89 | Bom | Verde limão |
| 60 – 74 | Regular | Âmbar |
| 40 – 59 | Atenção | Laranja |
| < 40 | Crítico | Vermelho |

---

### 4. Variação de Peso Corporal (%)

> **Onde aparece:** Pós-Sessão (cartão "Variação de Peso"), Analytics

**Fórmula:**

```
Variação (%) = ((PesoAntes_kg - PesoDepois_kg) / PesoAntes_kg) × 100
```

**Implementação no frontend** ([`PostSession.jsx`](frontend/src/pages/PostSession.jsx), linha 113):

```js
const weightLossPct = (weightLossKg / session.pre_weight_kg) * 100;
```

**Alerta de desidratação** (linha 114):

```js
const isWeightAlert = weightLossPct > 2;
```

Um alerta vermelho é exibido automaticamente quando a perda de peso ultrapassa **2% do peso pré-sessão**, limiar clínico reconhecido para desidratação significativa que compromete o desempenho.

**Também usado no backend** para calcular a média de perda de peso nas sessões concluídas ([`analyticsController.js`](backend/src/controllers/analyticsController.js), linha 57):

```sql
AVG(CASE WHEN pre_weight_kg > 0 AND post_weight_kg > 0
    THEN ((pre_weight_kg - post_weight_kg) / pre_weight_kg) * 100
    ELSE NULL END) AS avg_weight_loss_pct
```

---

### 5. Volume de Recuperação Recomendado

> **Onde aparece:** Pós-Sessão (painel "Recuperação Recomendada")

Baseado nas diretrizes do ACSM (American College of Sports Medicine), que recomendam a ingestão de **150% do volume perdido** para recuperação completa em 4–6 horas.

**Fórmula:**

```
Recuperação (ml) = DéficitHídrico (ml) × 1,5
```

**Implementação** (função `calcRecoveryFluid` em [`calculations.js`](frontend/src/utils/calculations.js), linha 71):

```js
export function calcRecoveryFluid(deficitMl) {
  return Math.round(deficitMl * 1.5);
}
```

> O painel de recuperação só é exibido se `déficit > 0`. Caso o peso pós-sessão não tenha sido informado, o sistema exibe uma mensagem orientando o atleta a monitorar sinais clínicos.

---

### 6. Escala de Cor da Urina (WUTS)

> **Onde aparece:** Pré-Sessão (seletor de cor), Histórico, Analytics

O sistema utiliza a **Wee Urine Test Scale (WUTS)**, escala validada internacionalmente de 8 níveis para avaliação do estado de hidratação via colorimetria urinária.

**Definição das cores** (em [`calculations.js`](frontend/src/utils/calculations.js), linha 1–10):

| Nível | Status clínico | Cor visual |
|---|---|---|
| 1 | Ótimo | `#FFF9C4` — Quase transparente |
| 2 | Ótimo | `#FFF176` — Amarelo muito claro |
| 3 | Bom | `#FFEE58` — Amarelo claro |
| 4 | Aceitável | `#FFD600` — Amarelo médio |
| 5 | Atenção | `#FFA000` — Amarelo escuro |
| 6 | Desidratado | `#E65100` — Âmbar/laranja |
| 7 | Grave | `#BF360C` — Laranja escuro |
| 8 | Crítico | `#4E342E` — Marrom |

---

### 7. Taxa de Sudorese Estimada (Monitoramento em Tempo Real)

> **Onde aparece:** Tela de Monitoramento Ativo

Durante a sessão ativa, o sistema **não tem acesso ao peso pós-sessão** (ainda não encerrada). Por isso, exibe uma **estimativa simulada** que parte de um valor base de `1,4 L/h` e sofre pequenas flutuações aleatórias a cada 8 segundos para dar a sensação de monitoramento dinâmico.

**Implementação** ([`ActiveMonitoring.jsx`](frontend/src/pages/ActiveMonitoring.jsx), linha 117–122):

```js
const sim = setInterval(() => {
  setSweatRate((r) => parseFloat((r + (Math.random() - 0.5) * 0.05).toFixed(2)));
}, 8000);
```

> ⚠️ Esta é uma **estimativa visual** para feedback em tempo real. O valor definitivo e preciso da taxa de sudorese é calculado apenas no encerramento da sessão, quando o peso pós-treino é informado.

---

### 8. Déficit Hídrico em Tempo Real (Monitoramento Ativo)

> **Onde aparece:** Tela de Monitoramento Ativo (widget inferior direito)

Durante a sessão, o sistema rastreia um **balanço hídrico simplificado** em tempo real, baseado somente nas ingestões registradas. Inicia em `-450 ml` (estimativa de déficit inicial médio por transpiração antes do primeiro registro) e incrementa a cada ingestão.

**Implementação** ([`ActiveMonitoring.jsx`](frontend/src/pages/ActiveMonitoring.jsx), linha 54–57 e 139–143):

```js
// Estado inicial
const [hydricDeficit, setHydricDeficit] = useState(-450);

// A cada ingestão registrada:
setHydricDeficit((d) => d + ml);
```

Quando o valor é **negativo** → exibido em vermelho (déficit)  
Quando o valor é **positivo** → exibido em verde (reposição atingida)

---

### 9. Temperatura Ambiente (Open-Meteo)

> **Onde aparece:** Monitoramento Ativo, Pós-Sessão

A temperatura ambiente **não é inserida manualmente** — ela é capturada automaticamente via **API Open-Meteo** (gratuita, sem chave de API) usando a geolocalização do dispositivo.

**Implementação** ([`ActiveMonitoring.jsx`](frontend/src/pages/ActiveMonitoring.jsx), linha 90–114):

```js
navigator.geolocation.getCurrentPosition(async ({ coords }) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`
  );
  const data = await res.json();
  const temp = data.current_weather?.temperature;
  setAmbientTemp(temp);
});
```

Se a permissão de localização for negada ou a API falhar, o campo exibe `—` sem impedir o fluxo da sessão.

---

### 10. Médias e Totais Analytics (período 7, 14 e 30 dias)

> **Onde aparece:** Dashboard (gráfico semanal), página Analytics

Todas as médias são calculadas diretamente no banco de dados via SQL agregado no [`analyticsController.js`](backend/src/controllers/analyticsController.js):

| Métrica | SQL | Período |
|---|---|---|
| Sessões por dia da semana | `COUNT(*) GROUP BY DAYOFWEEK` | 7 dias |
| Média de taxa de sudorese | `AVG(sweat_rate_lh)` | Todas / 30 dias |
| Média de déficit hídrico | `AVG(hydric_deficit_ml)` | Todas / 14 dias |
| Total de minutos treinados | `SUM(duration_minutes)` | Todas / 30 dias |
| Média de duração por sessão | `AVG(duration_minutes)` | Todas |
| Perda média de peso (%) | `AVG((pre_kg - post_kg) / pre_kg * 100)` | Todas |
| Sessões mensais | `COUNT(*) GROUP BY DATE_FORMAT(ended_at, '%Y-%m')` | 6 meses |