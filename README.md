# Otávio Garcez Personal · Pacote para GitHub e Coolify

Versão personalizada com a logo original de Otávio Garcez Personal e visual em laranja e preto. Sistema para personal trainer presencial, online e híbrido, com painel do personal e acesso individual dos alunos. React + Vite + Supabase. Os módulos e cadastros da versão anterior são preservados.

## O que mudou

- Visão geral com metas semanais, treinos realmente concluídos, alertas de acompanhamento e agenda.
- Cada aluno recebe um painel próprio: Meu dia, Treinos, Evolução, Conversa e Meu plano.
- Treino guiado com séries, repetições/tempo, cargas, descanso de 30/60/90 segundos, esforço percebido e observação final.
- Rascunho do treino salvo por aluno, ficha e dispositivo. É possível continuar depois no mesmo navegador.
- Meta de dias de treino na semana, conquistas por treinos concluídos e histórico de cargas. Sem pontuações fictícias.
- Check-in de energia, sono e humor recebido no painel do personal.
- Mensagens entre aluno e personal; metas, foco do ciclo e recado personalizados.
- Treinos editáveis e arquiváveis; mensalidades podem voltar de pago para pendente.
- Convite vinculado ao e-mail do aluno, login próprio e revogação de acesso.
- Separação de dados aplicada no banco. Aluno não pode ler o snapshot do personal, consultar outros alunos ou alterar o financeiro.
- Proteção contra sobrescrita entre dispositivos e recuperação de alterações locais pendentes.
- Exportação de backup em JSON nas configurações.

## Testar no computador

Requer Node 22.12 ou mais recente.

```sh
npm ci
npm run dev
```

Sem variáveis Supabase, abre uma demonstração com dados de exemplo. Os registros ficam naquele navegador. Em **Alunos e painéis**, abra um aluno para ver sua experiência e use **Personalizar e gerenciar acesso** para ajustar a meta e a mensagem.

A prévia acessada pelo personal permite lançar treino/check-in para o aluno. Esses lançamentos entram no histórico. O portal online é o acesso do próprio aluno em outro dispositivo.

## Atualizar uma instalação existente

1. Faça uma cópia do banco Supabase e exporte os registros do painel anterior antes de atualizar.
2. No mesmo projeto Supabase, execute **`supabase/upgrade-v2.sql`** no SQL Editor. A atualização é aditiva e pode ser executada novamente. Não apaga os snapshots existentes.
3. Atualize o código e faça um novo build com a mesma URL e a mesma chave pública do Supabase.
4. Entre com a mesma conta do personal. Cadastros e demais módulos continuam nas chaves `evofit_*_v2` já utilizadas. Os novos eventos são armazenados em tabelas separadas.
5. Cada aluno precisa de um convite criado pelo personal. Contas antigas de personal continuam funcionando.

Se outra sessão alterou os mesmos registros, a gravação é interrompida para não sobrescrever a versão recente. Exporte a cópia local, recarregue e concilie as alterações. Uma cópia de recuperação também fica no navegador. Não há mesclagem automática de snapshots.

## Instalação nova do banco

1. Crie um projeto Supabase.
2. Execute `supabase/INSTALACAO_COMPLETA.sql` no SQL Editor (já reúne a estrutura inicial e a atualização).
3. Em Authentication, configure a URL do site e as Redirect URLs do domínio publicado, incluindo `https://SEU-DOMINIO/**` para a confirmação da conta do aluno.
4. Copie `.env.example` para `.env` e preencha:

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

A chave `anon` pública de projetos antigos também pode ser usada nesta variável. **Nunca utilize a chave `service_role` no front-end.**

Contas novas de personal começam vazias; os exemplos aparecem apenas na demonstração sem Supabase.

## Coolify

Use o repositório ou extraia o pacote na raiz do seu repositório, mantendo o Dockerfile na raiz.

- Build Pack: **Dockerfile**.
- Dockerfile Location: `/Dockerfile`.
- Porta interna: **80**.
- Configure domínio com HTTPS.
- Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` como variáveis disponíveis durante o **build**. O Dockerfile recebe essas duas variáveis como argumentos de build. Alterar só as variáveis em runtime não muda um bundle Vite já compilado: faça redeploy.
- Não é necessário volume para os registros online: ficam no projeto Supabase. Os backups do banco devem ser configurados no Supabase. Rascunhos de treino e cache de recuperação ficam no navegador do usuário.
- O container possui healthcheck HTTP e serve as rotas de entrada pelo Nginx.

Alternativa com Nixpacks: site estático, `npm ci`, `npm run build`, diretório `dist`, variáveis disponíveis no build.

## Liberar o painel de um aluno

1. Cadastre o aluno com seu e-mail.
2. Em **Alunos e painéis → Personalizar e gerenciar acesso**, defina meta semanal, foco e mensagem. Salve.
3. Em **Acesso individual**, clique em **Gerar novo convite**. A sincronização é concluída antes da geração.
4. Copie o link e envie ao aluno. O sistema não envia mensagens ou e-mails de convite automaticamente.
5. O aluno abre o link, cria a conta com o mesmo e-mail autorizado e escolhe sua senha. Se a confirmação de e-mail estiver habilitada, confirme e entre novamente; reabra o convite se necessário.
6. Após ativar, ele pode entrar por `https://SEU-DOMINIO/?portal=1` com o próprio e-mail e senha.

O convite inicial vence em 7 dias; o acesso já ativado permanece válido até ser revogado. Gerar outro convite desfaz o vínculo anterior e exige nova ativação. A conta do personal não deve ser utilizada para aceitar um convite de aluno. Alunos com mais de um personal podem selecionar seu acompanhamento.

## Como os dados são separados

O personal mantém seu `app_snapshots`, protegido por RLS. Os alunos recebem apenas uma projeção autorizada por funções no banco: sua ficha, avaliações sem anotações internas, agenda, mensalidades e eventos do próprio acompanhamento. As permissões de leitura direta das novas tabelas são exclusivas ao personal proprietário. Escritas do aluno passam por validação no banco e não alteram fichas, dados de outros alunos ou pagamentos.

Conversa e atividades são consultadas ao abrir a tela, ao voltar à aba e a cada 20 segundos. É necessário internet para enviar registros no portal online. O rascunho de treino permanece local quando o envio falha; não há fila offline de mensagens ou check-ins. Um mesmo treino pode ser concluído uma vez por dia, evitando duplicações por clique repetido.

## Validação

```sh
npm test
npm run build
```

Os testes usam PostgreSQL embarcado com PGlite para aplicar a migração duas vezes sobre dados existentes e verificar RLS, e-mail de convite, rejeição de acesso de terceiros, projeção de dados, validação de registros, duplicação de treino, revogação e conflito de versão. Há testes adicionais de metas semanais e compatibilidade das prescrições anteriores.

A publicação exige executar o SQL e configurar um projeto Supabase real. Os testes locais não substituem a conferência das Redirect URLs e do envio de confirmação do projeto de produção.
