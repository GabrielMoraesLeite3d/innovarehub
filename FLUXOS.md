# Innovare OS - Fluxos Principais

## 🔐 Autenticação e Login

### Fluxo de Login
1. Usuário acessa `/login`
2. Insere email e senha
3. Sistema valida credenciais no banco (`local_users`)
4. Se válido, retorna `teamType` e `role`
5. Usuário é redirecionado para o dashboard apropriado

### Credenciais de Demo

**Innovare Team (Acesso Total)**
- Email: `comercialinnovarehub@gmail.com`
- Senha: `Innovare10#`
- Perfil: Admin
- Acesso: Todos os 10 módulos

**Rocket Team (Acesso Restrito)**
- Email: `rocket1@example.com` (ou rocket2-10@example.com)
- Senha: `Rocket123!`
- Perfil: Usuário
- Acesso: APENAS módulo Innovare Rocket

---

## 👥 Controle de Acesso por Team Type

### Innovare Team (9 pessoas)
Acesso total a:
- ✅ Dashboard Geral
- ✅ Projetos (Kanban 8 fases)
- ✅ CRM (Pipeline de Leads)
- ✅ Gestão de Pessoas
- ✅ Financeiro
- ✅ P&D e Patentes
- ✅ Contraprovas Técnicas
- ✅ Innovare Rocket
- ✅ Treinamentos
- ✅ Recursos (Impressão 3D + Prototipagem)
- ✅ Painel de Admin (apenas admins)

### Rocket Team (30+ pessoas)
Acesso restrito a:
- ✅ Innovare Rocket APENAS
- ❌ Nenhum outro módulo ou dado

---

## 🛡️ RBAC (Role-Based Access Control)

### Verificação no Backend
Todos os procedimentos tRPC validam:
1. **Autenticação**: Usuário deve estar logado (`protectedProcedure`)
2. **Team Type**: Valida se `user.teamType` está na lista de permitidos
3. **Role** (para admin): Valida se `user.role === 'admin'`

### Exemplo de Proteção
```typescript
projects: router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const teamType = (ctx.user as any)?.teamType;
    requireTeamType(teamType, ['innovare_team']);
    return getAllProjects();
  }),
})
```

---

## 📊 Dashboard Geral (Innovare Team)

Exibe:
- **KPIs**: Projetos Ativos, Leads em Andamento, Receita Confirmada, Total de Leads
- **Projetos Recentes**: Últimos projetos criados
- **Status Geral**: Contadores de Concluídos, Em Andamento, Pendentes
- **Pipeline de Leads**: Distribuição por status (Entrada, Triagem, Orçamento, Proposta, Aprovado)

---

## 🚀 Innovare Rocket (Innovare Team + Rocket Team)

### Acesso
- **Innovare Team**: Visualização completa + edição
- **Rocket Team**: Visualização apenas (leitura)

### Conteúdo
- **5 Missões Estratégicas**:
  1. MG-REIS-N1 (Estação Pré-fabricada) - 65% progresso
  2. TREM Sat (Sistema de Satélites) - 42% progresso
  3. MG-VERA-CRUZ-N3 (Equipamento Industrial) - 78% progresso
  4. FRMF Sudeste (Saneamento) - 15% progresso
  5. Lançamento Rebel Aerospace - 8% progresso

- **Subsistemas por Missão**: Estrutura, Aviónica, Telemetria, Payload, Software, etc.

---

## 👤 Painel de Admin (Innovare Team Admins Only)

### Funcionalidades
- **Listar Usuários**: Visualizar todos os usuários (Innovare + Rocket)
- **Criar Usuário**: Adicionar novo usuário com email, senha, nome, team type e role
- **Deletar Usuário**: Remover usuário do sistema
- **Filtrar**: Separação visual entre Innovare Team e Rocket Team

### Restrições
- Apenas usuários com `role === 'admin'` e `teamType === 'innovare_team'`
- Tentativas não autorizadas retornam erro 403 FORBIDDEN

---

## 🔑 Autenticação Local (Email/Senha)

### Hash de Senha
- Algoritmo: SHA-256
- Verificação: Comparação de hash armazenado com hash da entrada
- Segurança: Case-sensitive, suporta caracteres especiais

### Tabela `local_users`
```sql
CREATE TABLE local_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(320) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  name TEXT,
  teamType ENUM('innovare_team', 'rocket_team') NOT NULL,
  role ENUM('user', 'admin') NOT NULL,
  isActive INT DEFAULT 1,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🧪 Testes

### Cobertura de Testes (39 testes)
- **RBAC Tests** (24): Validação de acesso por team type
- **Auth Tests** (14): Hash de senha, verificação, cenários reais
- **Logout Tests** (1): Limpeza de sessão

### Executar Testes
```bash
pnpm test
```

---

## 📱 Navegação Principal

### Sidebar (Innovare Team)
1. Dashboard
2. Projetos
3. CRM
4. Pessoas
5. Financeiro
6. P&D
7. Innovare Rocket
8. Recursos
9. Treinamentos
10. Contraprovas
11. Admin (apenas admins)

### Sidebar (Rocket Team)
- Inovare Rocket (ÚNICO módulo)

---

## 🚀 Próximos Passos (Opcional para MVP+)

- [ ] Formulários de criação/edição para Projetos, CRM, Financeiro, etc.
- [ ] Integração com Stripe para pagamentos
- [ ] Notificações em tempo real
- [ ] Relatórios e exportação de dados
- [ ] Integração com calendário
- [ ] Webhooks para automações
- [ ] API pública para integrações externas

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique as credenciais de demo
2. Limpe o cache do navegador
3. Verifique se o banco de dados está conectado
4. Revise os logs do servidor em `.manus-logs/`

---

**Versão**: 1.0.0  
**Data**: Maio 2026  
**Status**: MVP Completo com Autenticação e RBAC
