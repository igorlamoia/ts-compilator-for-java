# Backend — TS Compilator API

Serviço FastAPI independente que substitui as API Routes do Next.js. Fornece autenticação, gerenciamento de turmas, exercícios e submissões para o IDE de Java--.

## Stack

| Tecnologia | Uso |
|---|---|
| Python 3.12+ | Linguagem |
| FastAPI | Framework web (async-first) |
| SQLAlchemy 2.0 async + asyncpg | ORM + driver PostgreSQL |
| Pydantic V2 | Validação de schemas |
| Alembic | Migrações de banco |
| PyJWT + Passlib/BCrypt | Autenticação JWT e hashing |
| pydantic-settings | Configuração via `.env` |
| uv | Gerenciador de pacotes |
| pytest + pytest-asyncio | Testes com SQLite in-memory |

## Pré-requisitos

- Python 3.12+
- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- PostgreSQL rodando (para desenvolvimento/produção)

## Início Rápido

### 1. Instalar dependências

```bash
cd backend
uv sync
```

Para incluir dependências de desenvolvimento (testes):

```bash
uv sync --dev
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e preencha obrigatoriamente:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/tscompilator
SECRET_KEY=  # gere com: openssl rand -hex 32
```

> **SECRET_KEY é obrigatória.** O servidor não sobe sem ela.

### 3. Criar o banco de dados

```bash
# Criar o banco no PostgreSQL
createdb tscompilator

# Aplicar migrações (quando disponíveis)
uv run alembic upgrade head
```

> Durante o desenvolvimento inicial, você pode usar `RUN_CREATE_ALL=true` no `.env` para criar as tabelas automaticamente sem Alembic. **Nunca use isso em produção.**

### 4. Iniciar o servidor

```bash
uv run uvicorn app.main:app --reload --port 8000
```

A API estará disponível em `http://localhost:8000`.

Documentação interativa (Swagger): `http://localhost:8000/docs`

## Testes

Os testes usam **SQLite in-memory** — não precisam de PostgreSQL rodando.

```bash
# Rodar todos os testes
uv run pytest

# Com output detalhado
uv run pytest -v

# Com cobertura
uv run pytest --cov=app --cov-report=term-missing

# Rodar um arquivo específico
uv run pytest tests/test_auth.py -v
```

**Suite atual: 34 testes, 0 falhas.**

## Estrutura de Pastas

```
backend/
├── app/
│   ├── main.py                  # Ponto de entrada, lifespan, CORS
│   ├── core/
│   │   ├── config.py            # Settings via pydantic-settings
│   │   ├── security.py          # JWT (PyJWT) e hashing (BCrypt)
│   │   └── dependencies.py      # SessionDep, CurrentUserIdDep
│   ├── db/
│   │   ├── session.py           # AsyncSession + engine
│   │   └── base.py              # DeclarativeBase
│   ├── models/                  # Modelos SQLAlchemy (tabelas)
│   ├── schemas/                 # Schemas Pydantic V2 (request/response)
│   └── modules/
│       ├── auth/                # POST /auth/register, /login, GET /me
│       ├── users/               # GET/PATCH /users
│       ├── classes/             # CRUD /classes + join
│       ├── exercises/           # CRUD /exercises + test cases
│       └── submissions/         # CRUD /submissions + grade
├── migrations/                  # Migrações Alembic
├── scripts/                     # ETL e utilitários
├── tests/
│   ├── conftest.py              # Fixtures async (SQLite in-memory)
│   ├── factories.py             # Helpers de criação de dados de teste
│   ├── test_auth.py
│   ├── test_users.py
│   ├── test_classes.py
│   ├── test_exercises.py
│   └── test_submissions.py
├── Dockerfile
├── pyproject.toml
└── .env.example
```

## Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/auth/register` | Registrar usuário | — |
| POST | `/auth/login` | Login, retorna JWT | — |
| GET | `/auth/me` | Usuário autenticado | Bearer |
| GET | `/users` | Listar usuários da org | ADMIN/TEACHER |
| GET | `/users/{id}` | Perfil do usuário | Bearer |
| PATCH | `/users/{id}` | Atualizar perfil | Bearer |
| POST | `/classes` | Criar turma | TEACHER |
| GET | `/classes` | Listar turmas | Bearer |
| GET | `/classes/{id}` | Detalhe da turma | Bearer |
| POST | `/classes/{id}/join` | Entrar na turma via código | STUDENT |
| POST | `/exercises` | Criar exercício | TEACHER |
| GET | `/exercises` | Listar exercícios | Bearer |
| GET | `/exercises/{id}` | Detalhe + test cases | Bearer |
| PATCH | `/exercises/{id}` | Atualizar exercício | Owner |
| DELETE | `/exercises/{id}` | Deletar exercício | Owner |
| POST | `/exercises/{id}/test-cases` | Adicionar test case | Owner |
| DELETE | `/exercises/{id}/test-cases/{tcId}` | Remover test case | Owner |
| POST | `/submissions` | Enviar submissão | STUDENT |
| GET | `/submissions` | Listar submissões | Bearer |
| GET | `/submissions/{id}` | Detalhe | Bearer |
| PATCH | `/submissions/{id}/grade` | Dar nota e feedback | TEACHER |
| GET | `/health` | Health check | — |

## Docker

```bash
# Build
docker build -t ts-compilator-backend .

# Run
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql+asyncpg://... \
  -e SECRET_KEY=sua-chave-secreta \
  ts-compilator-backend
```

## Variáveis de Ambiente

| Variável | Obrigatória | Default | Descrição |
|----------|-------------|---------|-----------|
| `DATABASE_URL` | Sim | — | URL do PostgreSQL (asyncpg) |
| `SECRET_KEY` | Sim | — | Chave para assinar JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Não | `1440` | Expiração do token (minutos) |
| `CORS_ORIGINS` | Não | `["http://localhost:3000"]` | Origens permitidas |
| `RUN_CREATE_ALL` | Não | `false` | Criar tabelas automaticamente (dev only) |

## Desenvolvimento

### Adicionar uma migration

```bash
uv run alembic revision --autogenerate -m "describe change"
uv run alembic upgrade head
```

### Acessar o banco via Alembic shell

```bash
uv run alembic shell
```

### Gerar SECRET_KEY segura

```bash
openssl rand -hex 32
```
