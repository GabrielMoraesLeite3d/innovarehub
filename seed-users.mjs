import mysql from 'mysql2/promise';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'innovare_os',
};

const INNOVARE_TEAM = [
  { name: 'Gabriel', email: 'comercialinnovarehub@gmail.com', password: 'Innovare10#', role: 'admin' },
  { name: 'Larissa', email: 'larissa@innovare.com', password: 'Innovare10#', role: 'user' },
  { name: 'Nicolly', email: 'nicolly@innovare.com', password: 'Innovare10#', role: 'user' },
  { name: 'Amanda', email: 'amanda@innovare.com', password: 'Innovare10#', role: 'user' },
  { name: 'Yasmim', email: 'yasmim@innovare.com', password: 'Innovare10#', role: 'user' },
  { name: 'Davi', email: 'davi@innovare.com', password: 'Innovare10#', role: 'user' },
  { name: 'Gabriel N.', email: 'gabrieln@innovare.com', password: 'Innovare10#', role: 'user' },
  { name: 'Vinícius', email: 'vinicius@innovare.com', password: 'Innovare10#', role: 'user' },
  { name: 'Laura', email: 'laura@innovare.com', password: 'Innovare10#', role: 'user' },
];

const ROCKET_TEAM = [
  { name: 'Rocket User 1', email: 'rocket1@example.com', password: 'Rocket123!' },
  { name: 'Rocket User 2', email: 'rocket2@example.com', password: 'Rocket123!' },
  { name: 'Rocket User 3', email: 'rocket3@example.com', password: 'Rocket123!' },
  { name: 'Rocket User 4', email: 'rocket4@example.com', password: 'Rocket123!' },
  { name: 'Rocket User 5', email: 'rocket5@example.com', password: 'Rocket123!' },
  { name: 'Rocket User 6', email: 'rocket6@example.com', password: 'Rocket123!' },
  { name: 'Rocket User 7', email: 'rocket7@example.com', password: 'Rocket123!' },
  { name: 'Rocket User 8', email: 'rocket8@example.com', password: 'Rocket123!' },
  { name: 'Rocket User 9', email: 'rocket9@example.com', password: 'Rocket123!' },
  { name: 'Rocket User 10', email: 'rocket10@example.com', password: 'Rocket123!' },
];

async function seedUsers() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✓ Conectado ao banco de dados');

    // Clear existing users
    console.log('\n🗑️  Limpando usuários existentes...');
    await connection.execute('DELETE FROM local_users');
    console.log('✓ Usuários removidos');

    // Seed Innovare Team
    console.log('\n👥 Adicionando Innovare Team (9 usuários)...');
    for (const user of INNOVARE_TEAM) {
      const passwordHash = hashPassword(user.password);
      await connection.execute(
        'INSERT INTO local_users (email, passwordHash, name, teamType, role, isActive) VALUES (?, ?, ?, ?, ?, ?)',
        [user.email, passwordHash, user.name, 'innovare_team', user.role, 1]
      );
      console.log(`  ✓ ${user.email} (${user.role})`);
    }
    console.log(`✓ ${INNOVARE_TEAM.length} usuários da Innovare Team adicionados`);

    // Seed Rocket Team
    console.log('\n🚀 Adicionando Rocket Team (10 usuários)...');
    for (const user of ROCKET_TEAM) {
      const passwordHash = hashPassword(user.password);
      await connection.execute(
        'INSERT INTO local_users (email, passwordHash, name, teamType, role, isActive) VALUES (?, ?, ?, ?, ?, ?)',
        [user.email, passwordHash, user.name, 'rocket_team', 'user', 1]
      );
      console.log(`  ✓ ${user.email}`);
    }
    console.log(`✓ ${ROCKET_TEAM.length} usuários da Rocket Team adicionados`);

    console.log('\n✅ Seed de usuários concluído com sucesso!');
    console.log('\n📝 Credenciais de Demo:\n');
    console.log('🔐 INNOVARE TEAM (Acesso Total):');
    console.log(`   Email: comercialinnovarehub@gmail.com`);
    console.log(`   Senha: Innovare10#`);
    console.log(`   Perfil: Admin\n`);
    console.log('🚀 ROCKET TEAM (Acesso Apenas Rocket):');
    console.log(`   Email: rocket1@example.com`);
    console.log(`   Senha: Rocket123!`);
    console.log(`   Perfil: Usuário\n`);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seedUsers();
