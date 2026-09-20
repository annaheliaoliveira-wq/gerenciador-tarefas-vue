const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Tarefa } = require('../models');

async function inicializarBanco() {
  await sequelize.sync();

  try {
    const [colunas] = await sequelize.query("PRAGMA table_info('tarefas');");
    const temUsuarioId = colunas.some(c => c.name === 'usuarioId');
    if (!temUsuarioId) {
      await sequelize.query("ALTER TABLE tarefas ADD COLUMN usuarioId INTEGER REFERENCES usuarios(id);");
    }
  } catch (err) {
    console.warn(err.message);
  }

  const senhaAdminHash = await bcrypt.hash('admin123', 10);
  let admin = await Usuario.findOne({ where: { email: 'admin@teste.com' } });
  if (!admin) {
    admin = await Usuario.create({
      nome: 'Administrador',
      email: 'admin@teste.com',
      senha: senhaAdminHash,
      perfil: 'admin'
    });
  } else {
    admin.senha = senhaAdminHash;
    await admin.save();
  }

  const senhaUserHash = await bcrypt.hash('user123', 10);
  let user = await Usuario.findOne({ where: { email: 'user@teste.com' } });
  if (!user) {
    user = await Usuario.create({
      nome: 'Usuário Teste',
      email: 'user@teste.com',
      senha: senhaUserHash,
      perfil: 'user'
    });
  } else {
    user.senha = senhaUserHash;
    await user.save();
  }

  if (admin) {
    await Tarefa.update({ usuarioId: admin.id }, { where: { usuarioId: null } });
  }
}

module.exports = inicializarBanco;
