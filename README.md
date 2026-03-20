# EvoFit Pro • Supabase Ready

Sistema completo para personal trainer com:
- dashboard
- alunos
- avaliações físicas
- treinos
- agenda
- check-ins
- financeiro
- área do aluno
- autenticação Supabase
- sincronização em nuvem por usuário
- modo demo local quando o Supabase ainda não estiver configurado

## Rodar localmente
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e preencha:
```bash
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key_aqui
```

Se você não preencher essas variáveis, o sistema abre em **modo demo** e salva no navegador.

## Configurar o Supabase
1. Crie um projeto no Supabase.
2. Abra o **SQL Editor**.
3. Rode o arquivo `supabase/schema.sql`.
4. Pegue a **Project URL** e a **Publishable key**.
5. Preencha o `.env`.
6. Rode o projeto ou faça deploy no Coolify.

## Como funciona a nuvem
Esta versão salva todos os módulos do app em uma tabela `app_snapshots`, separada por usuário autenticado.

Isso deixa o sistema pronto para:
- login real
- dados online por personal
- sincronização entre dispositivos
- evolução futura para tabelas mais detalhadas

## Deploy no Coolify
Use:
- Build Pack: `Nixpacks`
- Static Site: `ON`
- Install Command: `npm install`
- Build Command: `npm run build`
- Publish Directory: `dist`

### Variáveis no Coolify
Adicione:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Observações
- Sem `.env`, o app funciona em demo.
- Com `.env`, ele libera login por e-mail e sincronização com Supabase.
- Se o seu projeto Supabase exigir confirmação de e-mail, a conta pode precisar ser confirmada antes do primeiro login.
