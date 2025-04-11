const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Series = sequelize.define('Series', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    round: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    conference: {
        type: DataTypes.ENUM('East', 'West'),
        allowNull: false
    },
    team1Wins: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    team2Wins: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('ongoing', 'completed'),
        defaultValue: 'ongoing'
    }
});

module.exports = Series;
