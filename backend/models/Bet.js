const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bet = sequelize.define('Bet', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    team: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'won', 'lost'),
        defaultValue: 'pending'
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    hooks: {
        afterUpdate: async (bet) => {
            if (bet.changed('status')) {
                const user = await bet.getUser();
                if (bet.status === 'won') {
                    bet.points = 10;
                    user.totalPoints += 10;
                    await user.save();
                    console.log(`Pari ${bet.id} gagné: +10 points - Total utilisateur: ${user.totalPoints}`);
                } else if (bet.status === 'lost') {
                    bet.points = -5;
                    user.totalPoints = Math.max(0, user.totalPoints - 5);
                    await user.save();
                    console.log(`Pari ${bet.id} perdu: -5 points - Total utilisateur: ${user.totalPoints}`);
                }
            }
        }
    }
});

module.exports = Bet;
