import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'innovare_os',
};

const COLLABORATORS = [
  { name: 'Gabriel', role: 'CEO', email: 'gabriel@innovare.com' },
  { name: 'Larissa', role: 'Sócia', email: 'larissa@innovare.com' },
  { name: 'Nicolly', role: 'CFO', email: 'nicolly@innovare.com' },
  { name: 'Amanda', role: 'CMO', email: 'amanda@innovare.com' },
  { name: 'Yasmim', role: 'CX', email: 'yasmim@innovare.com' },
  { name: 'Davi', role: 'PM', email: 'davi@innovare.com' },
  { name: 'Gabriel N.', role: 'CTO', email: 'gabrieln@innovare.com' },
  { name: 'Vinícius', role: 'CD', email: 'vinicius@innovare.com' },
  { name: 'Laura', role: 'COO', email: 'laura@innovare.com' },
];

const PROJECTS = [
  {
    name: 'Estação Pré-fabricada MG-REIS-N1',
    client: 'Sabesp',
    status: 'producao',
    phase: 'Produção',
    priority: 'high',
    value: 450000,
    responsible: 'Gabriel',
    description: 'Maior projeto de estação pré-fabricada do Brasil',
  },
  {
    name: 'Sistema de Satélites TREM',
    client: 'Agência Espacial',
    status: 'conceito',
    phase: 'Conceito',
    priority: 'high',
    value: 280000,
    responsible: 'Gabriel N.',
    description: 'Desenvolvimento de subsistemas de satélites',
  },
  {
    name: 'Equipamento Industrial MG-VERA-CRUZ-N3',
    client: 'Indústria Mineradora',
    status: 'qa',
    phase: 'QA',
    priority: 'medium',
    value: 180000,
    responsible: 'Davi',
    description: 'Equipamento para processamento mineral',
  },
  {
    name: 'Solução de Saneamento FRMF Sudeste',
    client: 'FRMF',
    status: 'proposta',
    phase: 'Proposta',
    priority: 'medium',
    value: 220000,
    responsible: 'Larissa',
    description: 'Solução integrada de saneamento para região sudeste',
  },
  {
    name: 'Lançamento Rebel Aerospace',
    client: 'Rebel Aerospace',
    status: 'kickoff',
    phase: 'Kickoff',
    priority: 'high',
    value: 350000,
    responsible: 'Gabriel',
    description: 'Projeto estratégico de lançamento aeroespacial',
  },
];

const LEADS = [
  {
    name: 'Empresa de Saneamento XYZ',
    contact: 'João Silva',
    email: 'joao@xyz.com',
    status: 'entrada',
    value: 150000,
    responsible: 'Yasmim',
    diagnosis: 'Necessita solução de tratamento de água',
  },
  {
    name: 'Indústria ABC Ltda',
    contact: 'Maria Santos',
    email: 'maria@abc.com',
    status: 'briefing',
    value: 280000,
    responsible: 'Amanda',
    diagnosis: 'Busca equipamento de prototipagem rápida',
  },
  {
    name: 'Governo do Estado',
    contact: 'Carlos Oliveira',
    email: 'carlos@gov.br',
    status: 'proposta',
    value: 420000,
    responsible: 'Gabriel',
    diagnosis: 'Infraestrutura para região metropolitana',
  },
  {
    name: 'Startup Tech Inovadora',
    contact: 'Ana Costa',
    email: 'ana@startup.com',
    status: 'orcamento_elaboracao',
    value: 95000,
    responsible: 'Davi',
    diagnosis: 'Prototipagem de conceito inovador',
  },
  {
    name: 'Multinacional de Engenharia',
    contact: 'Roberto Ferreira',
    email: 'roberto@multinacional.com',
    status: 'negociacao',
    value: 550000,
    responsible: 'Larissa',
    diagnosis: 'Projeto de grande escala com múltiplos subsistemas',
  },
];

const FINANCIALS = [
  { type: 'receita', description: 'Projeto Estação MG-REIS-N1', amount: 150000, date: '2026-04-01', status: 'confirmado', category: 'Projetos' },
  { type: 'receita', description: 'Consultoria Técnica', amount: 25000, date: '2026-04-05', status: 'confirmado', category: 'Serviços' },
  { type: 'despesa', description: 'Salários Abril', amount: 85000, date: '2026-04-30', status: 'confirmado', category: 'Pessoal' },
  { type: 'despesa', description: 'Materiais Prototipagem', amount: 12500, date: '2026-04-10', status: 'confirmado', category: 'Materiais' },
  { type: 'comissao', description: 'Comissão Projeto Estação', amount: 15000, date: '2026-04-15', status: 'confirmado', category: 'Comissões' },
  { type: 'despesa', description: 'Aluguel Escritório', amount: 8000, date: '2026-04-01', status: 'confirmado', category: 'Infraestrutura' },
  { type: 'receita', description: 'Receita Projeto TREM Sat', amount: 95000, date: '2026-04-20', status: 'previsto', category: 'Projetos' },
  { type: 'aporte', description: 'Aporte de Capital', amount: 50000, date: '2026-04-25', status: 'confirmado', category: 'Capital' },
];

const PND_ITEMS = [
  {
    provisionalName: 'Estrutura Modular Inteligente',
    internalCode: 'PND-001',
    area: 'Engenharia Estrutural',
    status: 'prototipo',
    problemStatement: 'Necessidade de estruturas modulares que se adaptem a diferentes terrenos',
    patentPotential: 'Alto',
    secretLevel: null,
    nextStep: 'Iniciar testes de resistência mecânica',
  },
  {
    provisionalName: 'Sistema de Satélites Miniaturizados',
    internalCode: 'PND-002',
    area: 'Aeroespacial',
    status: 'conceito',
    problemStatement: 'Redução de custo e peso de satélites para aplicações comerciais',
    patentPotential: 'Muito Alto',
    secretLevel: 'Confidencial',
    nextStep: 'Pesquisa de referência em tecnologias similares',
  },
  {
    provisionalName: 'Processo de Fabricação Otimizado',
    internalCode: 'PND-003',
    area: 'Fabricação Digital',
    status: 'teste',
    problemStatement: 'Aumentar velocidade de prototipagem sem perder qualidade',
    patentPotential: 'Médio',
    secretLevel: null,
    nextStep: 'Validar resultados com contraprovas técnicas',
  },
];

const ROCKET_MISSIONS = [
  {
    name: 'MG-REIS-N1',
    description: 'Maior projeto de estação pré-fabricada do Brasil',
    status: 'em_andamento',
    progress: 65,
    startDate: '2025-06-01',
    expectedEndDate: '2026-09-30',
    lead: 'Gabriel',
    subsystems: ['Estrutura', 'Fundação', 'Sistemas Hidráulicos', 'Integração'],
  },
  {
    name: 'TREM Sat',
    description: 'Sistema de satélites para comunicação e monitoramento',
    status: 'em_andamento',
    progress: 42,
    startDate: '2025-09-01',
    expectedEndDate: '2027-03-31',
    lead: 'Gabriel N.',
    subsystems: ['Estrutura', 'Aviónica', 'Telemetria', 'Payload', 'Software'],
  },
  {
    name: 'MG-VERA-CRUZ-N3',
    description: 'Equipamento industrial para mineração',
    status: 'em_andamento',
    progress: 78,
    startDate: '2025-03-01',
    expectedEndDate: '2026-06-30',
    lead: 'Davi',
    subsystems: ['Motor', 'Casing', 'Tubeira', 'Recuperação'],
  },
  {
    name: 'FRMF Sudeste 2026',
    description: 'Solução de saneamento para região sudeste',
    status: 'planejamento',
    progress: 15,
    startDate: '2026-05-01',
    expectedEndDate: '2027-12-31',
    lead: 'Larissa',
    subsystems: ['Tratamento', 'Distribuição', 'Monitoramento'],
  },
  {
    name: 'Lançamento Rebel Aerospace',
    description: 'Projeto estratégico de lançamento aeroespacial',
    status: 'planejamento',
    progress: 8,
    startDate: '2026-06-01',
    expectedEndDate: '2028-06-30',
    lead: 'Gabriel',
    subsystems: ['Estrutura', 'Motor', 'Aviónica', 'Payload', 'Logística'],
  },
];

const RESOURCES = [
  {
    name: 'Creality K2 Pro',
    type: 'impressora_3d',
    status: 'disponivel',
    location: 'Laboratório 1',
    description: 'Impressora 3D de alta precisão',
    lastMaintenance: '2026-03-15',
    nextMaintenance: '2026-06-15',
  },
  {
    name: 'Creality K2 Combo/CFS',
    type: 'impressora_3d',
    status: 'em_uso',
    location: 'Laboratório 2',
    description: 'Impressora 3D com sistema de corte',
    lastMaintenance: '2026-04-01',
    nextMaintenance: '2026-07-01',
  },
  {
    name: 'Ender 5 S1 Pro',
    type: 'impressora_3d',
    status: 'disponivel',
    location: 'Laboratório 1',
    description: 'Impressora 3D de grande formato',
    lastMaintenance: '2026-02-20',
    nextMaintenance: '2026-05-20',
  },
  {
    name: 'Microretífica',
    type: 'prototipagem',
    status: 'disponivel',
    location: 'Oficina',
    description: 'Ferramenta de precisão para acabamento',
    lastMaintenance: '2026-03-10',
    nextMaintenance: '2026-06-10',
  },
  {
    name: 'Solda MIG/MAG/TIG',
    type: 'prototipagem',
    status: 'em_uso',
    location: 'Oficina',
    description: 'Equipamento de soldagem multiprocesso',
    lastMaintenance: '2026-04-05',
    nextMaintenance: '2026-07-05',
  },
  {
    name: 'Cortadora Plasma',
    type: 'prototipagem',
    status: 'manutencao',
    location: 'Oficina',
    description: 'Cortadora de plasma para metais',
    lastMaintenance: '2026-04-20',
    nextMaintenance: '2026-07-20',
    defectDescription: 'Problema na válvula de ar comprimido',
  },
];

const TRAININGS = [
  {
    title: 'Modelagem 3D Avançada',
    description: 'Treinamento em modelagem 3D para engenharia',
    instructor: 'Gabriel',
    status: 'em_andamento',
    progress: 60,
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    participants: ['Davi', 'Vinícius', 'Laura'],
    checklist: [
      { title: 'Módulo 1: Fundamentos', completed: true },
      { title: 'Módulo 2: Modelagem Paramétrica', completed: true },
      { title: 'Módulo 3: Renderização', completed: false },
      { title: 'Módulo 4: Otimização', completed: false },
      { title: 'Projeto Final', completed: false },
    ],
  },
  {
    title: 'Fabricação Digital e Prototipagem',
    description: 'Workshop de fabricação digital e prototipagem rápida',
    instructor: 'Vinícius',
    status: 'planejado',
    progress: 0,
    startDate: '2026-05-15',
    endDate: '2026-06-15',
    participants: ['Amanda', 'Yasmim'],
    checklist: [
      { title: 'Segurança em Oficina', completed: false },
      { title: 'Impressão 3D', completed: false },
      { title: 'Corte e Gravação', completed: false },
      { title: 'Soldagem', completed: false },
    ],
  },
  {
    title: 'Gestão de Projetos Ágeis',
    description: 'Certificação em metodologias ágeis',
    instructor: 'Larissa',
    status: 'concluido',
    progress: 100,
    startDate: '2026-01-15',
    endDate: '2026-03-31',
    participants: ['Davi', 'Gabriel N.', 'Laura'],
    checklist: [
      { title: 'Scrum Fundamentals', completed: true },
      { title: 'Kanban', completed: true },
      { title: 'Planning e Estimativas', completed: true },
      { title: 'Certificação', completed: true },
    ],
  },
];

async function seedDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✓ Conectado ao banco de dados');

    // Seed Projects
    console.log('\n📋 Adicionando Projetos...');
    for (const project of PROJECTS) {
      await connection.execute(
        'INSERT INTO projects (name, client, status, phase, priority, value, responsible, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [project.name, project.client, project.status, project.phase, project.priority, project.value, project.responsible, project.description]
      );
    }
    console.log(`✓ ${PROJECTS.length} projetos adicionados`);

    // Seed CRM Leads
    console.log('\n👥 Adicionando Leads...');
    for (const lead of LEADS) {
      await connection.execute(
        'INSERT INTO crm_leads (name, contact, email, status, value, responsible, diagnosis) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [lead.name, lead.contact, lead.email, lead.status, lead.value, lead.responsible, lead.diagnosis]
      );
    }
    console.log(`✓ ${LEADS.length} leads adicionados`);

    // Seed Financials
    console.log('\n💰 Adicionando Lançamentos Financeiros...');
    for (const financial of FINANCIALS) {
      await connection.execute(
        'INSERT INTO financials (type, description, amount, date, status, category) VALUES (?, ?, ?, ?, ?, ?)',
        [financial.type, financial.description, financial.amount, financial.date, financial.status, financial.category]
      );
    }
    console.log(`✓ ${FINANCIALS.length} lançamentos adicionados`);

    // Seed P&D Items
    console.log('\n🔬 Adicionando Itens de P&D...');
    for (const item of PND_ITEMS) {
      await connection.execute(
        'INSERT INTO pnd (provisionalName, internalCode, area, status, problemStatement, patentPotential, secretLevel, nextStep) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [item.provisionalName, item.internalCode, item.area, item.status, item.problemStatement, item.patentPotential, item.secretLevel, item.nextStep]
      );
    }
    console.log(`✓ ${PND_ITEMS.length} itens de P&D adicionados`);

    // Seed Rocket Missions
    console.log('\n🚀 Adicionando Missões Rocket...');
    for (const mission of ROCKET_MISSIONS) {
      await connection.execute(
        'INSERT INTO rocket (name, description, status, progress, startDate, expectedEndDate, lead, subsystems) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [mission.name, mission.description, mission.status, mission.progress, mission.startDate, mission.expectedEndDate, mission.lead, JSON.stringify(mission.subsystems)]
      );
    }
    console.log(`✓ ${ROCKET_MISSIONS.length} missões adicionadas`);

    // Seed Resources
    console.log('\n🔧 Adicionando Recursos...');
    for (const resource of RESOURCES) {
      await connection.execute(
        'INSERT INTO resources (name, type, status, location, description, lastMaintenance, nextMaintenance, defectDescription) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [resource.name, resource.type, resource.status, resource.location, resource.description, resource.lastMaintenance, resource.nextMaintenance, resource.defectDescription || null]
      );
    }
    console.log(`✓ ${RESOURCES.length} recursos adicionados`);

    // Seed Trainings
    console.log('\n📚 Adicionando Treinamentos...');
    for (const training of TRAININGS) {
      await connection.execute(
        'INSERT INTO trainings (title, description, instructor, status, progress, startDate, endDate, participants, checklist) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [training.title, training.description, training.instructor, training.status, training.progress, training.startDate, training.endDate, JSON.stringify(training.participants), JSON.stringify(training.checklist)]
      );
    }
    console.log(`✓ ${TRAININGS.length} treinamentos adicionados`);

    console.log('\n✅ Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seedDatabase();
