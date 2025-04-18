'use strict';

const { User, Team, Series, Game, Bet } = require('../models');
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await Bet.destroy({ where: {} });
      await Game.destroy({ where: {} });
      await Series.destroy({ where: {} });
      await Team.destroy({ where: {} });
      await User.destroy({ where: {} });
      console.log('Données existantes supprimées');

      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      const hashedUserPassword = await bcrypt.hash('user123', 10);

      const users = await User.bulkCreate([
        { username: 'adri', email: 'adri@mail.com', password: hashedAdminPassword, role: 'admin', totalPoints: 0 },
        { username: 'thanos', email: 'thanos@mail.com', password: hashedUserPassword, role: 'user', totalPoints: 0 },
        { username: 'xav', email: 'xav@mail.com', password: hashedUserPassword, role: 'user', totalPoints: 0 },
        { username: 'sim', email: 'sim@mail.com', password: hashedUserPassword, role: 'user', totalPoints: 0 },
        { username: 'momo', email: 'momo@mail.com', password: hashedUserPassword, role: 'user', totalPoints: 0 },
        { username: 'bobo', email: 'bobo@mail.com', password: hashedUserPassword, role: 'user', totalPoints: 0 },
        { username: 'dids', email: 'dids@mail.com', password: hashedUserPassword, role: 'user', totalPoints: 0 }
      ]);
      console.log('Utilisateurs de SLAP créés');

      const teams = await Team.bulkCreate([
        // Conférence Est
        { name: 'Cleveland Cavaliers', conference: 'East', seed: 1 },
        { name: 'Boston Celtics', conference: 'East', seed: 2 },
        { name: 'New York Knicks', conference: 'East', seed: 3 },
        { name: 'Indiana Pacers', conference: 'East', seed: 4 },
        { name: 'Milwaukee Bucks', conference: 'East', seed: 5 },
        { name: 'Detroit Pistons', conference: 'East', seed: 6 },
        { name: 'Orlando Magic', conference: 'East', seed: 7 },
        { name: 'Atlanta Hawks', conference: 'East', seed: 8 },

        // Conférence Ouest
        { name: 'Oklahoma City Thunder', conference: 'West', seed: 1 },
        { name: 'Houston Rockets', conference: 'West', seed: 2 },
        { name: 'Los Angeles Lakers', conference: 'West', seed: 3 },
        { name: 'Denver Nuggets', conference: 'West', seed: 4 },
        { name: 'Los Angeles Clippers', conference: 'West', seed: 5 },
        { name: 'Minnesota Timberwolves', conference: 'West', seed: 6 },
        { name: 'Golden State Warriors', conference: 'West', seed: 7 },
        { name: 'Dallas Mavericks', conference: 'West', seed: 8 }
      ]);
      console.log('Équipes créées');

      const series = await Series.bulkCreate([
        // Conférence Est
        { Team1Id: teams[0].id, Team2Id: teams[7].id, round: 1, conference: 'East' }, // Cavaliers vs Hawks
        { Team1Id: teams[1].id, Team2Id: teams[6].id, round: 1, conference: 'East' }, // Celtics vs Magic
        { Team1Id: teams[2].id, Team2Id: teams[5].id, round: 1, conference: 'East' }, // Knicks vs Pistons
        { Team1Id: teams[3].id, Team2Id: teams[4].id, round: 1, conference: 'East' }, // Pacers vs Bucks

        // Conférence Ouest
        { Team1Id: teams[8].id, Team2Id: teams[15].id, round: 1, conference: 'West' }, // Thunder vs Mavericks
        { Team1Id: teams[9].id, Team2Id: teams[14].id, round: 1, conference: 'West' }, // Rockets vs Warriors
        { Team1Id: teams[10].id, Team2Id: teams[13].id, round: 1, conference: 'West' }, // Lakers vs Timberwolves
        { Team1Id: teams[11].id, Team2Id: teams[12].id, round: 1, conference: 'West' }  // Nuggets vs Clippers
      ]);
      console.log('Séries créées');

      const games = await Game.bulkCreate([
        // Cavaliers vs Hawks
        { SeriesId: series[0].id, gameNumber: 1, date: '2025-04-20T19:00:00Z', HomeTeamId: teams[0].id, AwayTeamId: teams[7].id, status: 'scheduled' },

        // Celtics vs Magic
        { SeriesId: series[1].id, gameNumber: 1, date: '2025-04-20T21:30:00Z', HomeTeamId: teams[1].id, AwayTeamId: teams[6].id, status: 'scheduled' },

        // Knicks vs Pistons
        { SeriesId: series[2].id, gameNumber: 1, date: '2025-04-19T23:00:00Z', HomeTeamId: teams[2].id, AwayTeamId: teams[5].id, status: 'scheduled' },

        // Pacers vs Bucks
        { SeriesId: series[3].id, gameNumber: 1, date: '2025-04-19T19:00:00Z', HomeTeamId: teams[3].id, AwayTeamId: teams[4].id, status: 'scheduled' },

        // Thunder vs Mavericks
        { SeriesId: series[4].id, gameNumber: 1, date: '2025-04-20T17:00:00Z', HomeTeamId: teams[8].id, AwayTeamId: teams[15].id, status: 'scheduled' },

        // Rockets vs Warriors
        { SeriesId: series[5].id, gameNumber: 1, date: '2025-04-20T03:30:00Z', HomeTeamId: teams[9].id, AwayTeamId: teams[14].id, status: 'scheduled' },

        // Lakers vs Timberwolves
        { SeriesId: series[6].id, gameNumber: 1, date: '2025-04-19T23:30:00Z', HomeTeamId: teams[10].id, AwayTeamId: teams[13].id, status: 'scheduled' },

        // Nuggets vs Clippers
        { SeriesId: series[7].id, gameNumber: 1, date: '2025-04-19T21:30:00Z', HomeTeamId: teams[11].id, AwayTeamId: teams[12].id, status: 'scheduled' }
      ]);
      console.log('Matchs créés');

      // Création de quelques paris de test
      await Bet.bulkCreate([
        { UserId: users[1].id, GameId: games[0].id, TeamId: teams[0].id, team: teams[0].name, status: 'pending' },
        { UserId: users[2].id, GameId: games[0].id, TeamId: teams[7].id, team: teams[7].name, status: 'pending' }
      ]);
      console.log('Paris créés');

      console.log('Seed terminé avec succès !');
    } catch (error) {
      console.error('Erreur lors du seed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await Bet.destroy({ where: {} });
      await Game.destroy({ where: {} });
      await Series.destroy({ where: {} });
      await Team.destroy({ where: {} });
      await User.destroy({ where: {} });
      console.log('Seed annulé avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'annulation du seed:', error);
      throw error;
    }
  }
};
