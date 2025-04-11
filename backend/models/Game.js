const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Game = sequelize.define('Game', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    gameNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    homeScore: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    awayScore: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed'),
        defaultValue: 'scheduled'
    },
    winner: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    hooks: {
        afterUpdate: async (game) => {
            if (game.changed('status') && game.status === 'completed' && game.homeScore !== null && game.awayScore !== null) {
                // Déterminer le gagnant
                game.winnerId = game.homeScore > game.awayScore ? game.HomeTeamId : game.AwayTeamId;
                await game.save();

                // Mettre à jour les paris associés
                const bets = await game.getBets();
                for (const bet of bets) {
                    bet.status = bet.TeamId === game.winnerId ? 'won' : 'lost';
                    await bet.save();
                }
            }
        }
    }
});

module.exports = Game;
