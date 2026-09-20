const sequelize = require('../config/database');
const Tarefa = require('./Tarefa');
const Usuario = require('./Usuario');

Usuario.hasMany(Tarefa, { foreignKey: 'usuarioId', as: 'tarefas', onDelete: 'CASCADE' });
Tarefa.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

module.exports = {
  sequelize,
  Tarefa,
  Usuario
};
