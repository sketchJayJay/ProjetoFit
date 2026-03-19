# EvoFit Pro

Sistema completo em React para personal trainer, com visual premium e dados persistindo no navegador.

## Módulos
- Dashboard
- Alunos
- Avaliações físicas
- Treinos
- Agenda
- Check-ins
- Financeiro
- Área do aluno
- Configurações

## Rodar localmente
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deploy no Coolify
Use:
- Build Pack: Nixpacks
- Static Site: ON
- Install Command: `npm install`
- Build Command: `npm run build`
- Publish Directory: `dist`

## Observação
Esta versão salva os dados no `localStorage` do navegador. Para virar sistema online multiusuário, o próximo passo é integrar Supabase para autenticação, banco e storage.
