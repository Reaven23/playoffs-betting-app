const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Team = sequelize.define('Team', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    conference: {
        type: DataTypes.ENUM('East', 'West'),
        allowNull: false
    },
    seed: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Team;
