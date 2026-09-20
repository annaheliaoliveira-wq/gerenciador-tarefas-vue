const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tarefa = sequelize.define('Tarefa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  concluida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'tarefas',
  timestamps: true
});

module.exports = Tarefa;
