# 📚 Guia de Módulos - Innovare OS

Documentação detalhada de cada módulo da plataforma.

---

## 📊 Dashboard Geral

**O que é**: Visão consolidada de toda a Innovare Hub em uma única tela.

**Quem pode acessar**: Innovare Team (todos)

**O que você vê**:
- **KPIs** (4 cards principais):
  - Projetos Ativos: Número de projetos em andamento
  - Leads em Andamento: Leads que ainda não fecharam
  - Receita Confirmada: Total de receita confirmada (R$)
  - Total de Leads: Todos os leads cadastrados

- **Projetos Recentes**: Últimos 5 projetos criados
- **Status Geral**: Resumo de projetos (Concluídos, Em Andamento, Pendentes)
- **Pipeline de Leads**: Leads agrupados por status

**Como usar**:
1. Clique em um KPI para filtrar dados
2. Clique em "Ver todos" para ir ao módulo completo
3. Use os filtros para customizar a visualização

---

## 📋 Projetos (Kanban)

**O que é**: Gestão de projetos com visualização em Kanban (8 fases).

**Quem pode acessar**: Innovare Team (todos)

**As 8 Fases**:
1. **Entrada Lead**: Novo lead recebido
2. **Diagnóstico**: Análise do problema
3. **Proposta**: Proposta enviada ao cliente
4. **Kickoff**: Projeto aprovado, iniciando
5. **Conceito**: Desenvolvimento de conceito
6. **Produção**: Implementação
7. **QA**: Testes e validação
8. **Pós-projeto**: Entrega e acompanhamento

**Como criar um projeto**:
1. Clique em **"Novo Projeto"**
2. Preencha:
   - Nome do projeto
   - Descrição
   - Cliente
   - Fase inicial (geralmente "Entrada Lead")
   - Responsável
   - Data de início
   - Data de fim (estimada)
3. Clique em **"Criar"**

**Como mover um projeto**:
1. Veja o card do projeto
2. Clique e arraste para a próxima fase (em breve: drag-and-drop)
3. Ou clique no card e edite a fase

**Filtros**:
- Por prioridade (Baixa, Média, Alta, Crítica)
- Por responsável
- Por cliente

---

## 👥 CRM (Pipeline de Leads)

**O que é**: Gestão de relacionamento com clientes e pipeline de vendas.

**Quem pode acessar**: Innovare Team (todos)

**Os 9 Status de Leads**:
1. **Entrada**: Lead novo, sem contato
2. **Triagem**: Lead qualificado
3. **Orçamento Elaboração**: Proposta em preparação
4. **Proposta Enviada**: Orçamento enviado
5. **Aprovado**: Cliente aprovou a proposta
6. **Negociação**: Em discussão de termos
7. **Contrato**: Contrato assinado
8. **Implementação**: Projeto em execução
9. **Finalizado**: Projeto concluído

**Como criar um lead**:
1. Clique em **"Novo Lead"**
2. Preencha:
   - Nome da empresa
   - Contato (email, telefone)
   - Descrição do projeto
   - Valor estimado
   - Status inicial
   - Responsável
3. Clique em **"Criar"**

**Como registrar uma interação**:
1. Clique no lead
2. Clique em **"Nova Interação"**
3. Selecione o tipo:
   - Email
   - Telefone
   - Reunião
   - Proposta
   - Acompanhamento
4. Descreva a interação
5. Clique em **"Registrar"**

**Comissões**:
- Cada lead tem um responsável
- Quando o lead fecha (status "Finalizado"), o responsável recebe comissão
- Comissão = % do valor do projeto

---

## 👤 Pessoas (Equipe)

**O que é**: Gestão de membros da equipe, competências e histórico.

**Quem pode acessar**: Innovare Team (todos)

**Os 9 Membros da Innovare**:
1. Gabriel (Fundador e Diretor de Inovação)
2. Larissa (Engenheira)
3. Nicolly (Engenheira)
4. Amanda (Engenheira)
5. Yasmim (Pesquisadora)
6. Davi (Técnico)
7. Gabriel N. (Técnico)
8. Vinícius (Programador)
9. Laura (Administradora)

**Matriz de Competências**:
- Cada membro tem competências avaliadas de 0-5:
  - 0 = Não tem
  - 1 = Iniciante
  - 2 = Básico
  - 3 = Intermediário
  - 4 = Avançado
  - 5 = Especialista

**Competências Principais**:
- Engenharia Mecânica
- Engenharia de Software
- Engenharia Aeroespacial
- Prototipagem
- Modelagem 3D
- Fabricação Digital
- Gestão de Projetos
- Pesquisa e Desenvolvimento

**Como ver perfil de um membro**:
1. Clique no nome do membro
2. Veja:
   - Foto
   - Cargo
   - Competências
   - Projetos ativos
   - Histórico de atividades

---

## 💰 Financeiro

**O que é**: Gestão de receitas, despesas, comissões e fluxo de caixa.

**Quem pode acessar**: Innovare Team (todos)

**Seções**:
1. **Receitas**: Dinheiro que entra
   - Projetos finalizados
   - Serviços prestados
   - Outras fontes

2. **Despesas**: Dinheiro que sai
   - Salários
   - Equipamentos
   - Materiais
   - Aluguel
   - Outros

3. **Comissões**: Pagamentos por vendas
   - Por responsável
   - Por período
   - Cálculo automático

4. **Fluxo de Caixa**: Saldo mês a mês

**Como adicionar receita**:
1. Clique em **"Nova Receita"**
2. Preencha:
   - Descrição
   - Valor
   - Data
   - Categoria
   - Projeto relacionado (opcional)
3. Clique em **"Adicionar"**

**Como adicionar despesa**:
1. Clique em **"Nova Despesa"**
2. Preencha:
   - Descrição
   - Valor
   - Data
   - Categoria
   - Responsável
3. Clique em **"Adicionar"**

**Filtros**:
- Por período (mês, trimestre, ano)
- Por categoria
- Por responsável

---

## 🔬 P&D (Pesquisa e Desenvolvimento)

**O que é**: Gestão de patentes, pesquisa e documentos sigilosos.

**Quem pode acessar**: Innovare Team (todos)

**Seções**:
1. **Patentes**: Propriedade intelectual registrada
2. **Pesquisa**: Projetos de pesquisa em andamento
3. **Sigilo**: Documentos confidenciais

**Como registrar uma patente**:
1. Clique em **"Nova Patente"**
2. Preencha:
   - Título da patente
   - Descrição
   - Inventor(es)
   - Data de registro
   - Status (Pendente, Aprovada, Rejeitada)
   - Documentação
3. Clique em **"Registrar"**

**Como criar projeto de pesquisa**:
1. Clique em **"Nova Pesquisa"**
2. Preencha:
   - Título
   - Objetivo
   - Responsável
   - Data de início
   - Data de fim (estimada)
   - Orçamento
3. Clique em **"Criar"**

---

## ✅ Contraprovas Técnicas

**O que é**: Registro e validação de testes técnicos.

**Quem pode acessar**: Innovare Team (todos)

**Status de Contraprovas**:
- Em Andamento
- Concluída
- Falha
- Revisão

**Como registrar contraprova**:
1. Clique em **"Nova Contraprova"**
2. Preencha:
   - Título do teste
   - Descrição
   - Objetivo
   - Procedimento
   - Resultado esperado
   - Data do teste
   - Responsável
3. Clique em **"Registrar"**

**Como validar resultado**:
1. Clique na contraprova
2. Preencha:
   - Resultado obtido
   - Correções necessárias (se houver)
   - Evidência (fotos, vídeos)
   - Conclusão
3. Clique em **"Validar"**

---

## 🚀 Innovare Rocket

**O que é**: Sistema de comunicação para a competição LASC 2026.

**Quem pode acessar**: 
- Innovare Team: Acesso total
- Rocket Team: Acesso apenas a Rocket

**As 3 Missões**:
1. **CubeSat 2U**: Satélite para observação terrestre
2. **MG-VERA CRUZ-N1**: Foguete sólido 3km
3. **MG-REIS-N1**: Foguete sólido 1km

**Os 8 Subsistemas**:
1. Aviónica (controle de voo)
2. Estrutura (fuselagem)
3. Motor (combustível)
4. Propulsão (impulso)
5. Recuperação (paraquedas)
6. Energia (bateria)
7. Payload (carga útil)
8. Telemetria (transmissão de dados)

**Como usar**:
1. Clique em uma **missão**
2. Clique em um **subsistema**
3. Você vê:
   - **Chat**: Histórico de mensagens
   - **Tarefas**: Lista de tarefas

**Para Gabriel (Criando Tarefas)**:
1. Clique em **"Nova Tarefa"**
2. Preencha:
   - Título
   - Descrição
   - Prioridade (Baixa, Média, Alta, Crítica)
3. Clique em **"Criar"**

**Para Gabriel (Escrevendo Instruções)**:
1. Clique em **"Escrever Mensagem"**
2. Selecione tipo (Instrução, Status, Resposta, Comentário)
3. Escreva a mensagem
4. Clique em **"Enviar"**

**Para Rocket Team (Respondendo)**:
1. Leia as mensagens
2. Clique em **"Escrever Mensagem"**
3. Selecione **"Resposta"**
4. Escreva sua resposta
5. Clique em **"Enviar"**

**Para Rocket Team (Confirmando Tarefas)**:
1. Veja a tarefa na coluna direita
2. Quando concluir, clique em **"Marcar OK"**
3. A tarefa fica verde (Concluída)

---

## 📚 Treinamentos

**O que é**: Gestão de cursos e progresso de aprendizado.

**Quem pode acessar**: Innovare Team (todos)

**Como criar curso**:
1. Clique em **"Novo Curso"**
2. Preencha:
   - Título
   - Descrição
   - Instrutor
   - Área (Engenharia, Programação, Gestão, etc.)
   - Data de início
   - Data de fim
3. Clique em **"Criar"**

**Como atribuir curso a colaborador**:
1. Clique no curso
2. Clique em **"Atribuir"**
3. Selecione o colaborador
4. Clique em **"Confirmar"**

**Como acompanhar progresso**:
1. Veja a tabela de progresso
2. Cada colaborador mostra:
   - Status (Não iniciado, Em andamento, Concluído)
   - Porcentagem concluída
   - Data de conclusão (se concluído)

---

## 🔧 Recursos (Impressão 3D + Prototipagem)

**O que é**: Gestão de equipamentos e agendamento de uso.

**Quem pode acessar**: Innovare Team (todos)

**Equipamentos Disponíveis**:
1. **Creality K2 Pro** (Impressora 3D)
2. **Creality K2 Combo** (Impressora 3D)
3. **Creality Ender 5 S1 Pro** (Impressora 3D)
4. Espaço de Prototipagem
5. Ferramentas de Fabricação Digital

**Como agendar recurso**:
1. Clique em **"Novo Agendamento"**
2. Preencha:
   - Recurso (qual equipamento)
   - Data de início
   - Data de fim
   - Responsável
   - Projeto relacionado
   - Propósito (descrição)
3. Clique em **"Agendar"**

**Como ver disponibilidade**:
1. Veja o calendário do recurso
2. Datas verdes = Disponível
3. Datas vermelhas = Ocupado
4. Datas amarelas = Manutenção

**Status de Equipamento**:
- Disponível: Pronto para usar
- Em uso: Alguém está usando agora
- Manutenção: Não disponível
- Descartado: Fora de uso

---

## 📅 Calendário

**O que é**: Visualização integrada de eventos, reuniões e agendamentos.

**Quem pode acessar**: Innovare Team (todos)

**O que você vê**:
- Eventos (reuniões, treinamentos, apresentações)
- Agendamentos de recursos
- Tarefas de projetos
- Prazos

**Como criar evento**:
1. Clique em **"Novo Evento"**
2. Preencha:
   - Título
   - Descrição
   - Data e hora de início
   - Data e hora de fim
   - Local (presencial ou online)
   - Participantes
3. Clique em **"Criar"**

**Filtros**:
- Por pessoa
- Por tipo de evento
- Por recurso

---

## ⚙️ Admin

**O que é**: Painel de administração para gerenciar usuários.

**Quem pode acessar**: Apenas Gabriel (Admin)

**Funcionalidades**:
1. **Listar Usuários**: Veja todos cadastrados
2. **Criar Usuário**: Adicione novo membro
3. **Editar Usuário**: Mude dados
4. **Deletar Usuário**: Remova um usuário
5. **Filtrar**: Por tipo de equipe

**Como criar usuário**:
1. Clique em **"Adicionar Novo Usuário"**
2. Preencha:
   - Email
   - Senha
   - Nome
   - Tipo de Equipe (innovare_team ou rocket_team)
   - Perfil (user ou admin)
3. Clique em **"Criar"**

---

## 🎓 Dicas de Uso

**Dashboard**: Comece aqui para ter visão geral
**Projetos**: Gerencie o ciclo de vida dos projetos
**CRM**: Acompanhe oportunidades de venda
**Rocket**: Comunique com o time de competição
**Recursos**: Agende equipamentos com antecedência
**Calendário**: Sincronize com sua agenda pessoal

---

Pronto! Agora você conhece todos os módulos! 🚀
