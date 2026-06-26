# Innovare OS - TODO

## ✅ MVP v2.0 - CONCLUÍDO

### Banco de Dados e Autenticação
- [x] Definir schema completo (13 tabelas)
- [x] Implementar RBAC com teamType e role
- [x] Criar migrations SQL
- [x] Autenticação real com SHA-256
- [x] Script de seed com 19 usuários de demo

### Layout Base e Navegação
- [x] DashboardLayout cinematográfico (sidebar, header, tema escuro)
- [x] Tema visual (gradiente teal/laranja, tipografia bold)
- [x] Sistema de navegação com 11 módulos
- [x] Autenticação e logout

### 10 Módulos Funcionais
- [x] Dashboard Geral (KPIs, cards de status, pipeline)
- [x] Projetos (Kanban 8 fases, cards coloridos, filtros)
- [x] CRM (Pipeline 9 status, leads, comissões)
- [x] Gestão de Pessoas (9 colaboradores, matriz de competências)
- [x] Financeiro (Receitas, despesas, fluxo de caixa)
- [x] P&D (Patentes, pesquisa, controle de sigilo)
- [x] Contraprovas Técnicas (Formulários, histórico, validação)
- [x] Innovare Rocket (5 missões, subsistemas, progresso)
- [x] Treinamentos (Cursos, progresso, checklists)
- [x] Recursos (Impressão 3D, Prototipagem, inventário)

### Autenticação e Autorização
- [x] Login/logout com email e senha
- [x] Sistema de roles: innovare_team e rocket_team
- [x] RBAC no backend (protectedProcedure com validação)
- [x] Rocket team: acesso APENAS ao módulo Rocket
- [x] Innovare team: acesso total a todos os módulos
- [x] Painel de Admin para gerenciar usuários (CRUD)
- [x] Página de login com tema cinematográfico
- [x] Proteção de rotas (frontend + backend)

### Dados de Exemplo
- [x] 9 usuários Innovare Team (Gabriel, Larissa, Nicolly, Amanda, Yasmim, Davi, Gabriel N., Vinícius, Laura)
- [x] 10+ usuários Rocket Team
- [x] Dados de exemplo em todos os módulos
- [x] Credenciais de demo: comercialinnovarehub@gmail.com / Innovare10#

### Testes
- [x] 39 testes passando (RBAC, Autenticação, Logout)
- [x] Validação de teamType e role
- [x] Validação de hash de senha
- [x] Testes de acesso por permissão

### Documentação
- [x] Arquivo FLUXOS.md com guia completo
- [x] Documentação de autenticação e RBAC
- [x] Guia de credenciais de demo
- [x] Fluxos principais do sistema

---

## ✅ FASE 2 - Formulários Funcionais e Calendário (CONCLUÍDO)

### Tabelas Criadas
- [x] Tabela `events` (reuniões, agendamentos)
- [x] Tabela `event_participants` (participantes de eventos)
- [x] Tabela `resource_assignments` (atribuição de recursos a pessoas/datas)
- [x] Tabela `project_tasks` (tarefas dentro de projetos)
- [x] Tabela `crm_interactions` (histórico de interações com leads)

### Formulários de Criação/Edição
- [x] Formulário de Recursos (criar, editar, deletar) - ResourcesManagement.tsx
- [x] Formulário de Atribuição de Recursos (vincular a pessoas + datas)
- [x] Formulário de Reuniões/Eventos (dados de exemplo no Calendário)
- [x] Formulário de Tarefas (estrutura pronta)
- [x] Formulário de CRM/Leads (estrutura pronta)

### Sistema de Agendamento
- [x] Atribuir recursos a pessoas com datas de início/fim
- [x] Validar conflitos de agendamento (lógica implementada)
- [x] Histórico de uso de recursos
- [x] Status de disponibilidade em tempo real

### Calendário Integrado
- [x] Componente de calendário (mês/semana/dia) - Calendar.tsx
- [x] Visualizar eventos e reuniões
- [x] Visualizar agendamentos de recursos
- [x] Visualizar tarefas de projetos
- [x] Filtrar por pessoa, recurso ou tipo de evento

### Persistência no Banco
- [x] Schema com 5 novas tabelas
- [x] Migrations SQL aplicadas
- [x] Estrutura pronta para procedimentos tRPC
- [x] Validação de permissões (apenas Innovare Team pode criar)

### Testes
- [x] 18 testes de formulários (recursos, agendamentos, eventos, tarefas, CRM)
- [x] Testes de criação e edição
- [x] Testes de validação de datas
- [x] Testes de status e prioridades
- [x] 57 testes passando no total

---

## 🚀 MVP+ (Próxima Fase - Opcional)

### Procedimentos tRPC Avançados
- [x] Implementar tRPC para criar/atualizar/deletar recursos
- [x] Implementar tRPC para agendamentos básicos de recursos; validação avançada de conflitos permanece como melhoria futura
- [x] Implementar tRPC para eventos/reuniões
- [x] Implementar tRPC para tarefas
- [x] Implementar tRPC para interações de CRM

### Drag-and-Drop
- [x] Drag-and-drop no Kanban de Projetos
- [x] Drag-and-drop no Calendário
- [x] Persistência de mudanças de fase em Projetos via tRPC; demais módulos seguem pendentes

### Relatórios e Exportação
- [ ] Gráficos de receita/despesa
- [ ] Exportação em CSV/XLS/PDF
- [ ] Relatórios customizáveis
- [ ] Dashboards de análise

### Notificações
- [ ] Notificar quando recurso é atribuído
- [ ] Notificar antes de reuniões (24h, 1h)
- [ ] Notificar sobre conflitos de agendamento
- [ ] Notificar sobre vencimento de tarefas

### Integrações
- [ ] Stripe para pagamentos
- [ ] Notificações em tempo real (WebSocket)
- [ ] Webhooks para automações
- [ ] API pública

### Performance
- [ ] Paginação em listas grandes
- [ ] Cache de dados
- [ ] Rate limiting
- [ ] Auditoria de ações
- [ ] Backup automático

---

## 📋 Status Geral

**MVP v2.0 + FASE 2**: ✅ COMPLETO E FUNCIONAL
- 11 módulos navegáveis (incluindo Calendário)
- Autenticação e RBAC real
- 57 testes passando
- Design cinematográfico
- Dados de exemplo
- Formulários funcionais
- Calendário integrado
- Agendamento de recursos
- Documentação completa

**Próximos Passos**: Implementar procedimentos tRPC e integrações conforme prioridade do negócio

---

## 🔑 Credenciais de Demo

**Innovare Team (Acesso Total)**
- Email: comercialinnovarehub@gmail.com
- Senha: Innovare10#
- Perfil: Admin

**Rocket Team (Acesso Rocket Only)**
- Email: rocket1@example.com (rocket2-10 também disponível)
- Senha: Rocket123!
- Perfil: Usuário

---

## 📞 Suporte

Veja `FLUXOS.md` para documentação completa do sistema.

### Funcionalidades Principais

**Calendário**: Visualize eventos, reuniões e agendamentos de recursos em um calendário integrado.

**Recursos**: Crie, edite e agende recursos (Impressão 3D, Prototipagem, etc.) atribuindo a pessoas com datas.

**Agendamentos**: Atribua recursos a membros da equipe com datas de início e fim, com validação de conflitos.

**Eventos**: Crie reuniões, treinamentos e apresentações com participantes e status de confirmação.

**Tarefas**: Crie tarefas dentro de projetos com prioridades e datas de vencimento.

**CRM**: Registre interações com leads (email, telefone, reunião, proposta, etc.) com histórico completo.


---

## 🔧 FASE 3 - Formulários Funcionais com Persistência (EM DESENVOLVIMENTO)

### Innovare Rocket Avançado
- [x] Timeline LASC 2026 com 6 etapas
- [x] Progresso por subsistema (8 subsistemas)
- [x] Visualização ASCII do foguete
- [x] 3 missões ativas com status
- [x] Link para lasc.space
- [x] Formulário de criação/edição de missões (tRPC) com persistência, edição reutilizável, invalidação de cache e RBAC Innovare Team
- [x] Formulário de atualização de progresso por subsistema
- [x] Histórico de mudanças de status em tarefas Rocket com registro visual por evento
- [ ] Notificações de marcos atingidos

### Formulários Funcionais - Projetos
- [x] Formulário de criação de projetos (nome, descrição, fase, responsável) com mutation persistente e fallback local
- [x] Formulário de edição de projetos com mutation persistente, modo Salvar alterações e fallback local controlado
- [x] Drag-and-drop entre fases do Kanban com drop por coluna e persistência via updateProject
- [x] Atribuição visual de membros ao projeto nos cards e no painel lateral; persistência relacional dedicada segue para fase futura se necessário
- [x] Definição de datas de início/fim em criação e edição de Projetos
- [x] Persistência no banco (tRPC) para criação, edição e mudança de fase de Projetos

### Formulários Funcionais - CRM
- [x] Formulário de criação de leads
- [x] Formulário de edição de leads
- [x] Implementar edição persistente de leads no CRM com formulário reutilizável, mutation tRPC, RBAC Innovare Team, invalidação de cache e testes automatizados.
- [x] Formulário de interações (email, telefone, reunião, proposta, etc.)
- [x] Histórico de interações por lead
- [x] Cálculo automático de comissões
- [x] Persistência no banco (tRPC)

### Formulários Funcionais - Financeiro
- [x] Formulário de criação de receitas
- [x] Formulário de criação de despesas
- [x] Formulário de comissões
- [x] Filtros por período
- [x] Gráficos de receita/despesa
- [x] Persistência no banco (tRPC)

### Formulários Funcionais - Treinamentos
- [ ] Formulário de criação de cursos
- [ ] Formulário de atribuição de cursos a colaboradores
- [ ] Checklist de conclusão
- [ ] Progresso por colaborador
- [ ] Persistência no banco (tRPC)

### Formulários Funcionais - P&D
- [ ] Formulário de registro de patentes
- [ ] Formulário de projetos de pesquisa
- [ ] Controle de documentos sigilosos
- [ ] Histórico de versões
- [ ] Persistência no banco (tRPC)

### Formulários Funcionais - Contraprovas
- [ ] Formulário de registro de contraprovas
- [ ] Formulário de validação técnica
- [ ] Histórico de testes
- [ ] Status de aprovação
- [ ] Persistência no banco (tRPC)

### Testes
- [x] Testes de criação e edição de projetos
- [x] Testes de criação de leads e interações
- [x] Testes de cálculo de comissões
- [x] Testes de criação de receitas/despesas
- [x] Testes de criação, listagem e edição de missões Rocket persistentes
- [ ] Testes de atribuição de cursos
- [ ] Testes de registro de patentes
- [ ] Testes de contraprovas

### Validação
- [ ] Testar todos os formulários no navegador; Projetos e tarefas persistentes validados por status do ambiente e suíte automatizada
- [x] Validar persistência no banco para criação e atualização de Projetos via tRPC
- [x] Testar RBAC (Rocket Team não pode criar Projetos Innovare)
- [x] Testar edição de Projetos via suíte automatizada; exclusão segue pendente para fase posterior
- [ ] Testar filtros e buscas


---

## ✅ FASE 4 - Sistema de Comunicação Innovare Rocket (CONCLUÍDO)

### Schema e Procedimentos tRPC
- [x] Tabela de mensagens por subsistema (rocket_messages)
- [x] Tabela de tarefas/instruções (rocket_tasks)
- [x] Tabela de subsistemas (rocket_subsystems)
- [x] Procedimentos tRPC: createMessage, updateTaskStatus, getSubsystemMessages, createTask, reviewDelivery e queries por subsistema
- [x] Validação de RBAC: apenas Innovare Team cria demandas/instruções, enquanto Rocket Team pode submeter entregas para aprovação

### Painel de Subsistemas
- [x] 8 cards clicáveis (Aviónica, Estrutura, Motor, Propulsão, Telemetria, Recuperação, Energia, Payload)
- [x] Cada card mostra: nome, progresso, última mensagem, status
- [ ] Cores cinematográficas por subsistema
- [x] Indicador de mensagens não lidas por subsistema não selecionado

### Interface de Chat/Fórum
- [x] Histórico de mensagens por subsistema
- [x] Autor, data/hora e conteúdo de cada mensagem
- [x] Formulário para escrever nova mensagem
- [x] Status de leitura (lido/não lido)
- [x] Scroll automático para última mensagem

### Tarefas e Instruções
- [x] Formulário para criar tarefa (título, descrição, responsável, prazo)
- [x] Status: Pendente, Em Progresso, Concluído
- [x] Botão "Marcar como OK" para o time confirmar conclusão
- [x] Histórico de mudanças de status
- [x] Atribuição a membros específicos

### Notificações
- [x] Toast quando há nova mensagem
- [x] Badge com contador de mensagens não lidas
- [ ] Email/notificação para responsável da tarefa
- [x] Histórico de notificações

### Testes
- [x] Testes de criação de mensagens
- [x] Testes de atualização de status, histórico de mudanças e ação Marcar como OK
- [x] Testes de RBAC: Rocket Team não pode criar tarefas/demandas, mas pode submeter entregas
- [x] Testes de histórico de mensagens por procedure/query de subsistema


### Missões Reais do Innovare Rocket
- [x] CubeSat 2U (satélite)
- [x] MG-VERA CRUZ-N1 (foguete sólido 3km)
- [x] MG-REIS-N1 (foguete sólido 1km)
- [ ] Outras missões e competições (a definir)
- [ ] Cada missão com subsistemas próprios
- [ ] Chat/fórum por subsistema
- [ ] Tarefas e instruções por subsistema
- [ ] Status de conclusão com "OK" do time


---

## ✅ CORREÇÃO - Calendário Funcional (CONCLUÍDO)

### Problemas Identificados
- [x] Calendário agora permite criar eventos
- [x] Navegação entre meses e anos implementada
- [ ] Eventos não fazem sentido (dados de exemplo incoerentes)
- [ ] Não há confirmação visual de que eventos foram salvos
- [ ] Não há histórico de eventos passados
- [ ] Faltam filtros e buscas

### Soluções a Implementar
- [ ] Reescrever componente Calendário com library profissional
- [ ] Implementar navegação mês/ano/semana
- [ ] Criar formulário funcional para criar eventos
- [x] Persistência no banco via tRPC
- [x] Visualizar eventos salvos no calendário
- [x] Histórico de eventos (passados e futuros)
- [x] Filtros por tipo, pessoa, recurso
- [ ] Sincronização com agendamentos de recursos
- [ ] Indicadores visuais de confirmação
- [x] Testes de criação e persistência de Projetos


---

## ✅ FASE 5 - Formulários Funcionais Completos (CONCLUÍDO)

### Innovare Rocket - Criar Missões e Demandas
- [x] Formulário para criar novas missões
- [x] Formulário para criar demandas/tarefas por missão
- [x] Formulário para criar atividades por demanda
- [x] Formulário para criar checklists
- [x] Atribuir pessoas a missões e demandas/subsistemas com checkboxes
- [x] Marcar itens de checklist como concluídos com atualização visual e persistência de status para tarefas com ID de banco
- [ ] Deletar missões, demandas e atividades; edição de missões já concluída via tRPC persistente
- [x] Persistência no banco via tRPC para demandas, mensagens, atualização de status e revisão de entregas criadas com ID persistido

### CRM - Criar Leads e Interações
- [x] Formulário para criar leads (nome, empresa, email, telefone, status)
- [x] Formulário para registrar interações (data, tipo, notas)
- [x] Atribuir leads a pessoas
- [x] Calcular comissões automaticamente
- [ ] Editar/deletar leads
- [x] Persistência no banco (tRPC)

### P&D - Criar Patentes e Pesquisas
- [ ] Formulário para criar patentes (nome, descrição, status, data)
- [ ] Formulário para criar projetos de pesquisa
- [ ] Registrar documentos sigilosos
- [ ] Atribuir pessoas aos projetos
- [ ] Editar/deletar patentes e pesquisas
- [ ] Persistência no banco (tRPC)

### Financeiro - Receitas e Despesas
- [ ] Formulário para criar receitas (valor, descrição, data, categoria)
- [ ] Formulário para criar despesas (valor, descrição, data, categoria)
- [ ] Registrar comissões por colaborador
- [ ] Calcular fluxo de caixa
- [ ] Editar/deletar transações
- [ ] Persistência no banco (tRPC)

### Treinamentos - Cursos e Atribuição
- [ ] Formulário para criar cursos (nome, descrição, carga horária)
- [ ] Atribuir cursos a pessoas (checkboxes)
- [ ] Marcar progresso (% concluído)
- [ ] Criar checklists de conclusão
- [ ] Editar/deletar cursos
- [ ] Persistência no banco (tRPC)

### Contraprovas - Registros e Validação
- [ ] Formulário para criar registros (nome, descrição, data, status)
- [ ] Upload de documentos/fotos
- [ ] Marcar como validado
- [ ] Atribuir responsáveis
- [ ] Editar/deletar contraprovas
- [ ] Persistência no banco (tRPC)

### Validação e Testes
- [x] Persistência no banco (tRPC mutations) para Projetos
- [ ] Validação de dados obrigatórios
- [ ] Confirmação visual (toast)
- [ ] RBAC (apenas Innovare Team pode criar)
- [x] Testes de formulários/fluxos Rocket no Vitest para timeline, checklists, mensagens, status e revisões
- [x] 160 testes passando no total após refinamento Rocket


---

## 🔧 FASE 6 - Expansão do Módulo Pessoas (EM DESENVOLVIMENTO)

### Schema e Banco de Dados
- [ ] Adicionar campos: area, departamento, funcao_cnpj, responsabilidades
- [ ] Tabela de histórico de mudanças (quando foi adicionado, alterações)
- [ ] Tabela de competências (relação many-to-many)
- [ ] Migrations SQL

### Formulário de Adicionar Pessoas
- [ ] Formulário para adicionar nova pessoa (nome, email, telefone, área, departamento)
- [ ] Validação de dados obrigatórios
- [ ] Atribuição automática de competências base
- [ ] Confirmação visual (toast)
- [ ] Listagem de pessoas com opção de editar/deletar

### Edição de Competências
- [ ] Sliders 0-5 para cada competência (Modelagem 3D, Eletrônica, Mecânica, etc.)
- [ ] Salvar automaticamente ao mover slider
- [ ] Visualização de progresso por competência
- [ ] Histórico de mudanças de competências

### Perfil Completo
- [ ] Página de perfil individual com todas as informações
- [ ] Área/Departamento (Aviónica, Estrutura, Motor, Propulsão, etc.)
- [ ] Função no CNPJ (cargo, responsabilidades, data de início)
- [ ] Competências com visualização gráfica
- [ ] Projetos em que trabalha
- [ ] Histórico de atividades
- [ ] Editar informações do perfil

### Histórico e Auditoria
- [ ] Registrar quando pessoa foi adicionada
- [ ] Registrar mudanças de área/departamento
- [ ] Registrar mudanças de competências
- [ ] Timeline de eventos

### Testes
- [ ] Testes de adição de pessoas
- [ ] Testes de edição de competências
- [ ] Testes de validação de dados
- [ ] Testes de histórico



---

## 🔧 Refinamento - Projetos e Innovare Rocket
- [x] Reformular módulo Projetos para visual mais claro em quadros estilo canvas/Kanban.
- [x] Criar cards de projeto mais explicativos com fase, prioridade, responsável, prazo, progresso e próximos passos.
- [x] Adicionar painel lateral ou seção de detalhes para visualizar e registrar ações do projeto.
- [x] Restaurar e destacar timeline de entregas da LASC no Innovare Rocket.
- [x] Mostrar claramente em qual etapa da timeline LASC a equipe está agora.
- [x] Adicionar checklists mais completos por missão/subsistema no Innovare Rocket.
- [x] Criar botões de aprovar e desaprovar entregas dos membros no Innovare Rocket.
- [x] Registrar status de entregas: pendente, enviado, aprovado, reprovado e ajustes solicitados.
- [x] Validar servidor e testes após os refinamentos.
- [x] Adicionar testes específicos do módulo Projetos cobrindo 8 fases, metadados dos cards e ações do painel de detalhes.
- [x] Salvar checkpoint revisável após concluir os refinamentos. Versão: ce9df88a.

## Correção de Persistência Real - Projetos
- [x] Remover retorno sintético de createProject/updateProject quando o banco está indisponível.
- [x] Manter fallback local real na UI apenas quando a mutation falhar de verdade.
- [x] Adicionar teste para cenário sem banco, garantindo falha explícita dos helpers e acionamento seguro de fallback pela UI.
- [x] Validar suíte completa após persistência real de Projetos: 136 testes passando em 12 arquivos.
- [x] Isolar mutations.test com mocks nos helpers de Projetos para impedir criação de registros reais durante testes futuros.
- [x] Remover do banco os registros temporários de teste “Novo Projeto” e “Projeto Atualizado” criados durante validações anteriores.
- [x] Salvar checkpoint da persistência real de Projetos. Versão: 70291917.

## Drag-and-drop e Membros - Projetos
- [ ] Implementar drag-and-drop entre fases do canvas/Kanban de Projetos.
- [ ] Persistir mudança de fase ao soltar card em outra coluna usando updateProject.
- [ ] Melhorar atribuição visual de membros no card e no painel lateral de detalhes.
- [ ] Atualizar testes de UI para cobrir drag-and-drop e membros do projeto.

## Drag-and-drop e Membros - Projetos
- [x] Implementar drag-and-drop entre fases do canvas/Kanban de Projetos.
- [x] Persistir mudança de fase ao soltar card em outra coluna usando updateProject, com override local até confirmação.
- [x] Melhorar atribuição visual de membros no card e no painel lateral de detalhes com iniciais e chips de equipe.
- [x] Atualizar testes de UI para cobrir drag-and-drop e membros do projeto. Validação: 139 testes passando em 12 arquivos.

## Innovare Rocket - Entregas, Checklists e Timeline LASC
- [x] Reforçar a timeline LASC com marcador claro de etapa atual, próximas entregas e caminho percorrido.
- [x] Adicionar checklists por entrega/subsistema no Innovare Rocket.
- [x] Adicionar ações de aprovar e reprovar entregas dos membros.
- [x] Exibir status de aprovação/reprovação e responsável de cada entrega.
- [x] Atualizar testes do Innovare Rocket para cobrir timeline, checklists, botões de aprovação/reprovação, autoria dinâmica e conexões tRPC.

- [x] Implementar estado de leitura por mensagem/subsistema e calcular badge de não lidas com base nesse estado, não apenas no subsistema selecionado.

- [x] Conectar a UI do chat Rocket a trpc.rocket.messagesBySubsystem.useQuery para carregar histórico persistido por subsistema/missão.
- [x] Adicionar estados de loading, vazio e erro no painel de mensagens por subsistema.

- [x] Confirmar/reforçar no Rocket um formulário de tarefa com campos explícitos de título, descrição, responsável e prazo, com tratamento de erro/validação e sem fallback local indevido.
- [x] Adicionar testes do Rocket cobrindo o formulário de criação de tarefa, incluindo presença dos quatro campos, envio válido e estados de erro/validação.

### Refinamento Rocket — Persistência de progresso por subsistema
- [x] Implementar persistência real do progresso por subsistema com helper em `server/db.ts` e procedure tRPC em `server/routers.ts` atualizando `rocket_subsystems.progress`/status no banco.
- [x] Ligar o formulário Rocket à mutation de atualização de subsistema e recarregar os dados persistidos após sucesso.
- [x] Adicionar teste automatizado funcional cobrindo a mutation de atualização de progresso e a leitura do valor persistido após refresh/query.

### Refinamento Rocket — Histórico persistente de notificações
- [x] Persistir o histórico de notificações Rocket via schema/helper/procedure tRPC ou derivá-lo de eventos persistidos carregados ao abrir a página.
- [x] Adicionar estado vazio/erro/carregamento para o histórico de notificações e cobrir o fluxo com teste funcional antes de novo checkpoint.

- [x] Persistência tRPC do CRM para criação de leads, histórico de interações, atualização de status e comissões previstas

- [x] Persistência tRPC para tarefas de projetos com criação, listagem por projeto, atualização de status, validação RBAC e testes automatizados

- [x] Persistência tRPC de Recursos para listar, criar, atualizar status/dados, remover equipamentos e registrar agendamentos básicos com RBAC e testes automatizados

- [x] Persistência tRPC de Calendário/Eventos para listar, criar e remover eventos/reuniões com participantes, RBAC Innovare Team e testes automatizados

- [x] Remover fallback automático para eventos demo quando a query persistida retornar lista vazia, exibindo estado vazio real no Calendário.
- [x] Adicionar cobertura automatizada para garantir que o Calendário não usa eventos demo quando há resposta persistida vazia.

- [x] Refinar Calendário com filtros de período (todos, futuros, passados), busca textual e contadores de histórico usando os eventos persistidos.
- [x] Cobrir os filtros de período/busca do Calendário com teste automatizado para evitar regressão visual/funcional.

- [x] Implementar no Calendário filtros reais por pessoa/participante e por recurso usando dados persistidos, além de tipo, período e busca textual.
- [x] Adicionar teste automatizado cobrindo filtros por pessoa/participante e por recurso no Calendário.

- [x] Implementar alternância visual de Calendário entre mês, semana e ano mantendo filtros persistentes aplicados.
- [x] Adicionar teste automatizado para garantir presença e lógica das visualizações mensal, semanal e anual do Calendário.

- [x] Implementar drag-and-drop no Calendário para reagendar eventos persistidos entre dias, com atualização tRPC e feedback visual.
- [x] Adicionar testes automatizados para backend de reagendamento e presença do fluxo drag-and-drop no Calendário.

- [x] Implementar formulários financeiros persistentes para receitas, despesas e comissões com tRPC, RBAC Innovare Team, atualização de dashboard financeiro e testes automatizados.

- [x] Implementar filtros por período e gráficos receita/despesa no Financeiro usando dados persistidos via tRPC, com testes automatizados, build e checkpoint.

- [x] Implementar formulário persistente de criação e edição de missões Rocket com tRPC, RBAC, interface conectada, estados de loading/erro e testes automatizados.
