# Validação da versão 2

Verificado em 24/11/2026.

## Automatizado

`npm test`: 4 testes aprovados. O teste de permissões executa a migração duas vezes sobre registros existentes e verifica convite por e-mail, isolamento de alunos, rejeição de alterações diretas nas tabelas, validação de check-in e treino, idempotência da conclusão diária, revogação e conflito de atualização entre dispositivos. Os demais testes cobrem projeção de dados sem anotações privadas, semanas entre meses e prescrições da versão anterior.

`npm run build`: aprovado. Bundle separado entre aplicação, gráficos e cliente Supabase.

## Navegador

- Desktop: visão geral, cadastro e busca de aluno, criação e edição de ficha, arquivar/reativar, marcar pagamento e voltar a pendente.
- Aluno: ficha sugerida para o dia; marcação de 14 séries; carga registrada; descanso; fechamento e retomada do rascunho; conclusão; meta semanal e conquista atualizadas.
- Check-in enviado e exibido para o personal; mensagem do aluno e resposta do personal; outro aluno não recebe essa conversa.
- Recarregar a página mantém cadastros, histórico de treino, cargas e estado de conclusão.
- Layout de celular em iframe de 390 × 840: menu do personal, painel do aluno, navegação inferior e formulário de treino sem rolagem horizontal.
- Nenhum erro da aplicação registrado no console durante os fluxos conferidos.

## Conferência após publicação

Ainda é necessário aplicar o SQL e informar as variáveis do projeto Supabase. O fluxo de confirmação de e-mail, os convites em dois dispositivos e as Redirect URLs devem ser conferidos no ambiente real. O projeto não contém credenciais de produção. Nenhuma alteração foi feita no banco existente ou na publicação principal durante esta implementação.
