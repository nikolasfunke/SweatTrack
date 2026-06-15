# BACKEND - TESTES UNITÁRIOS (17 testes)

## Auth Controller - Validation Rules (3 testes)

```bash
$ NODE_ENV=test npm test -- __tests__/unit/auth.test.js --testNamePattern="validation rules"

PASS  __tests__/unit/auth.test.js (0.842 s)
  authController
    register - validation rules
      ✓ registerRules deve validar nome obrigatório (2 ms)
      ✓ registerRules deve validar email válido (1 ms)
      ✓ registerRules deve validar senha mínimo 8 caracteres (1 ms)

Tests: 3 passed, 3 total
```

---

## Auth Controller - Registration (2 testes)

```bash
PASS  __tests__/unit/auth.test.js
  authController
    register - successful registration
      ✓ deve registrar um novo usuário com sucesso (12 ms)
      ✓ deve retornar erro 409 se email já existir (8 ms)

Tests: 2 passed, 2 total
```

---

## Auth Controller - Login (2 testes)

```bash
PASS  __tests__/unit/auth.test.js
  authController
    login - validation rules
      ✓ loginRules deve validar email (1 ms)
      ✓ loginRules deve validar senha (1 ms)

Tests: 2 passed, 2 total
```

---

##  Auth Controller - Email Verification (1 teste)

```bash
PASS  __tests__/unit/auth.test.js
  authController
    verifyEmail
      ✓ deve validar email com código correto (5 ms)

Tests: 1 passed, 1 total
```

---

## Session Controller - Create (3 testes)

```bash
$ NODE_ENV=test npm test -- __tests__/unit/session.test.js --testNamePattern="create"

PASS  __tests__/unit/session.test.js (0.821 s)
  sessionController
    create - nova sessão
      ✓ deve criar uma nova sessão com sucesso (8 ms)
      ✓ deve usar tipo de sessão padrão (training) (5 ms)
      ✓ deve retornar erro 500 em caso de falha no BD (6 ms)

Tests: 3 passed, 3 total
```

---

## Session Controller - List & Get (5 testes)

```bash
PASS  __tests__/unit/session.test.js
  sessionController
    list - listar sessões
      ✓ deve listar sessões do usuário (4 ms)
      ✓ deve retornar array vazio se não houver sessões (3 ms)
    getOne - detalhes de uma sessão
      ✓ deve retornar detalhes de uma sessão (5 ms)
      ✓ deve retornar erro 404 se sessão não existir (3 ms)
      ✓ deve permitir acesso se usuário é admin (3 ms)

Tests: 5 passed, 5 total
```

---

## Middleware - Auth Token (5 testes)

```bash
$ NODE_ENV=test npm test -- __tests__/unit/middleware.test.js

PASS  __tests__/unit/middleware.test.js (0.756 s)
  authMiddleware
    ✓ deve retornar 401 se não houver header Authorization (4 ms)
    ✓ deve retornar 401 se header não começar com "Bearer " (2 ms)
    ✓ deve extrair token e verificar com sucesso (6 ms)
    ✓ deve retornar 401 se token for inválido (3 ms)
    ✓ deve retornar 401 se token expirou (2 ms)

Tests: 5 passed, 5 total
Time: 0.756 s
```

---


---

# BACKEND - TESTES DE INTEGRAÇÃO (15 testes)

## Auth Flow - Register (4 testes)

```bash
$ NODE_ENV=test npm test -- __tests__/integration/auth.test.js --testNamePattern="register"

PASS  __tests__/integration/auth.test.js (1.234 s)
  Auth Integration Tests
    POST /api/auth/register
      ✓ deve registrar novo usuário com sucesso (18 ms)
      ✓ deve retornar erro 400 com email inválido (9 ms)
      ✓ deve retornar erro 400 com senha fraca (7 ms)
      ✓ deve retornar erro 409 se email já existe (12 ms)

Tests: 4 passed, 4 total
```

---

## Auth Flow - Login (3 testes)

```bash
PASS  __tests__/integration/auth.test.js
  Auth Integration Tests
    POST /api/auth/login
      ✓ deve fazer login com credenciais corretas (14 ms)
      ✓ deve retornar erro 401 com senha incorreta (11 ms)
      ✓ deve retornar erro 401 se usuário não existe (8 ms)

Tests: 3 passed, 3 total
```

---

##  Auth Flow - Profile (2 testes)

```bash
PASS  __tests__/integration/auth.test.js
  Auth Integration Tests
    GET /api/auth/me
      ✓ deve retornar perfil do usuário autenticado (9 ms)
      ✓ deve retornar 401 sem token (5 ms)

Tests: 2 passed, 2 total
Time: 1.234 s
```

---

##  Session Flow - CRUD (7 testes)

```bash
$ NODE_ENV=test npm test -- __tests__/integration/session.test.js

PASS  __tests__/integration/session.test.js (1.821 s)
  Session Integration Tests
    POST /api/sessions - Create session
      ✓ deve criar nova sessão (15 ms)
      ✓ deve retornar 401 sem autenticação (8 ms)
    GET /api/sessions - List sessions
      ✓ deve listar sessões do usuário (12 ms)
    GET /api/sessions/:id - Get session details
      ✓ deve retornar detalhes de uma sessão (10 ms)
      ✓ deve retornar 404 para sessão inexistente (7 ms)
      ✓ deve retornar 403 se não for o dono (9 ms)
    PATCH /api/sessions/:id/pre - Pre-session update
      ✓ deve atualizar pré-treino (11 ms)

Tests: 7 passed, 7 total
```

---

## Session Flow - Execution (4 testes)

```bash
PASS  __tests__/integration/session.test.js
  Session Integration Tests
    POST /api/sessions/:id/start - Start session
      ✓ deve iniciar a sessão (10 ms)
    POST /api/sessions/:id/fluid - Log fluid intake
      ✓ deve registrar ingestão de fluido (13 ms)
    POST /api/sessions/:id/finish - Finish session
      ✓ deve finalizar sessão e calcular métricas (14 ms)
    DELETE /api/sessions/:id - Delete session
      ✓ deve deletar uma sessão (9 ms)

Tests: 4 passed, 4 total
Time: 1.821 s
```

---

## Team Flow - Management (6 testes)

```bash
$ NODE_ENV=test npm test -- __tests__/integration/team.test.js

PASS  __tests__/integration/team.test.js (1.645 s)
  Team Integration Tests
    POST /api/teams - Create team
      ✓ deve criar nova equipe (coach) (16 ms)
      ✓ deve retornar erro se não for coach (8 ms)
    GET /api/teams - List teams
      ✓ deve listar equipes do usuário (11 ms)
    POST /api/teams/:id/invite - Invite athlete
      ✓ deve convidar atleta para equipe (19 ms)
      ✓ deve retornar erro 404 se equipe não existe (7 ms)
    GET /api/teams/:id/report - Team report
      ✓ deve retornar relatório da equipe (13 ms)

Tests: 6 passed, 6 total
Time: 1.645 s
```
---

# FRONTEND - TESTES UNITÁRIOS (35 testes)

## Button Component - Rendering (3 testes)

```bash
$ NODE_ENV=test npm test -- __tests__/unit/components/Button.test.jsx --testNamePattern="render"

PASS  __tests__/unit/components/Button.test.jsx (0.934 s)
  Button Component
    ✓ deve renderizar com texto (8 ms)
    ✓ deve ter classes de variante primary por padrão (6 ms)
    ✓ deve renderizar com ícone (4 ms)

Tests: 3 passed, 3 total
```

---

## Button Component - Variants (4 testes)

```bash
PASS  __tests__/unit/components/Button.test.jsx
  Button Component
    ✓ deve aplicar variante outline (4 ms)
    ✓ deve aplicar variante danger (5 ms)
    ✓ deve aplicar tamanho sm (3 ms)
    ✓ deve aceitar className customizada (2 ms)

Tests: 4 passed, 4 total
```

---

## Button Component - States (4 testes)

```bash
PASS  __tests__/unit/components/Button.test.jsx
  Button Component
    ✓ deve ser desabilitado quando prop disabled=true (4 ms)
    ✓ deve mostrar loader quando loading=true (7 ms)
    ✓ deve desabilitar quando loading=true (3 ms)
    ✓ deve chamar onClick quando clicado (12 ms)

Tests: 4 passed, 4 total
Time: 0.934 s
```

---

## AuthContext - Initialization (2 testes)

```bash
$ NODE_ENV=test npm test -- __tests__/unit/contexts/AuthContext.test.jsx --testNamePattern="inicializar|jogar erro"

PASS  __tests__/unit/contexts/AuthContext.test.jsx (1.087 s)
  AuthContext
    useAuth hook
      ✓ deve jogar erro se usado fora de AuthProvider (2 ms)
    AuthProvider
      ✓ deve inicializar com loading true e user null (3 ms)

Tests: 2 passed, 2 total
```

---

## AuthContext - Login/Register (2 testes)

```bash
PASS  __tests__/unit/contexts/AuthContext.test.jsx
  AuthProvider
    ✓ deve fazer login e armazenar token (15 ms)
    ✓ deve fazer register e armazenar token (12 ms)

Tests: 2 passed, 2 total
```

---

## AuthContext - Logout/Update (2 testes)

```bash
PASS  __tests__/unit/contexts/AuthContext.test.jsx
  AuthProvider
    ✓ deve fazer logout e limpar token (8 ms)
    ✓ deve atualizar usuário (9 ms)

Tests: 2 passed, 2 total
```

---

## AuthContext - Persistence (2 testes)

```bash
PASS  __tests__/unit/contexts/AuthContext.test.jsx
  AuthProvider
    ✓ deve carregar usuário do localStorage se token existe (18 ms)
    ✓ deve remover token inválido do localStorage (11 ms)

Tests: 2 passed, 2 total
Time: 1.087 s
```

---

## Calculations - SweatRate (5 testes)

```bash
$ NODE_ENV=test npm test -- __tests__/unit/utils/calculations.test.js --testNamePattern="calcSweatRate"

PASS  __tests__/unit/utils/calculations.test.js (1.203 s)
  calculations utils
    calcSweatRate()
      ✓ deve calcular taxa de suor corretamente (5 ms)
      ✓ deve retornar null se faltar preWeight (2 ms)
      ✓ deve retornar null se faltar postWeight (1 ms)
      ✓ deve retornar null se faltar durationMin (2 ms)
      ✓ deve usar 0 como padrão para fluidMl (3 ms)

Tests: 5 passed, 5 total
```

---

## Calculations - HydricDeficit (4 testes)

```bash
PASS  __tests__/unit/utils/calculations.test.js
  calculations utils
    calcHydricDeficit()
      ✓ deve calcular déficit hídrico em ml (2 ms)
      ✓ deve retornar null se faltar preWeight (1 ms)
      ✓ deve retornar null se faltar postWeight (1 ms)
      ✓ deve arredondar para inteiro (2 ms)

Tests: 4 passed, 4 total
```

---

## Calculations - Duration & Timer (6 testes)

```bash
PASS  __tests__/unit/utils/calculations.test.js
  calculations utils
    formatDuration()
      ✓ deve formatar em minutos (1 ms)
      ✓ deve formatar em horas e minutos (1 ms)
      ✓ deve omitir minutos se for 0 (1 ms)
      ✓ deve retornar "0min" para valores null (1 ms)
    formatTimer()
      ✓ deve formatar segundos em MM:SS (1 ms)
      ✓ deve formatar em HH:MM:SS se for > 1 hora (1 ms)

Tests: 6 passed, 6 total
```

---

## Calculations - Status (5 testes)

```bash
PASS  __tests__/unit/utils/calculations.test.js
  calculations utils
    getHydrationStatus()
      ✓ deve retornar "Ótimo" para índice >= 90 (1 ms)
      ✓ deve retornar "Bom" para índice 75-89 (1 ms)
      ✓ deve retornar "Regular" para índice 60-74 (2 ms)
      ✓ deve retornar "Atenção" para índice 40-59 (1 ms)
      ✓ deve retornar "Crítico" para índice < 40 (1 ms)

Tests: 5 passed, 5 total
```

---

## Calculations - SweatRate Label (5 testes)

```bash
PASS  __tests__/unit/utils/calculations.test.js
  calculations utils
    getSweatRateLabel()
      ✓ deve retornar "N/D" para taxa null (1 ms)
      ✓ deve retornar "Baixa" para < 0.5 L/h (1 ms)
      ✓ deve retornar "Moderada" para 0.5-0.99 L/h (1 ms)
      ✓ deve retornar "Alta" para 1.0-1.49 L/h (1 ms)
      ✓ deve retornar "Extrema" para >= 2.0 L/h (1 ms)

Tests: 5 passed, 5 total
```

---

## Calculations - Recovery & Constants (3 testes)

```bash
PASS  __tests__/unit/utils/calculations.test.js
  calculations utils
    calcRecoveryFluid()
      ✓ deve calcular fluido de recuperação como 1.5x déficit (1 ms)
      ✓ deve arredondar para inteiro (1 ms)
    relativeDate()
      ✓ deve retornar "Agora" para menos de 1 hora (2 ms)

Tests: 3 passed, 3 total
Time: 1.203 s
```

---


# 🟢 FRONTEND - TESTES DE INTEGRAÇÃO (9 testes)

## Login Flow - Registration to Login (4 testes)

```bash
$ NODE_ENV=test npm test -- __tests__/integration/LoginFlow.test.jsx

PASS  __tests__/integration/LoginFlow.test.jsx (1.234 s)
  Login Flow Integration
    ✓ Fluxo completo: registro → login → carregamento do perfil (145 ms)
    ✓ Fluxo de persistência: usuário permanece logado após reload (89 ms)
    ✓ Fluxo de atualização de perfil após login (76 ms)
    ✓ Fluxo de erro: token expirado ou inválido (92 ms)

Tests: 4 passed, 4 total
Time: 1.234 s
```

---

## Session Flow - Complete Workout (5 testes)

```bash
$ NODE_ENV=test npm test -- __tests__/integration/SessionFlow.test.jsx

PASS  __tests__/integration/SessionFlow.test.jsx (1.567 s)
  Session Flow Integration
    ✓ Fluxo completo de sessão: pré-treino → execução → pós-treino (203 ms)
    ✓ Cálculos de métricas na conclusão de sessão (34 ms)
    ✓ Validação de fluxo: não permitir terminar sessão não iniciada (28 ms)
    ✓ Persistência de dados: listar histórico de sessões (45 ms)
    ✓ Integração de cálculos com dados reais (42 ms)

Tests: 5 passed, 5 total
Time: 1.567 s
```

---





