'use strict';

const { User, Team, Series, Game, Bet } = require('../models');
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Suppression des données existantes dans l'ordre inverse des dépendances
      await Bet.destroy({ where: {} });
      await Game.destroy({ where: {} });
      await Series.destroy({ where: {} });
      await Team.destroy({ where: {} });
      await User.destroy({ where: {} });
      console.log('Données existantes supprimées');

      // Hachage des mots de passe
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      const hashedUserPassword = await bcrypt.hash('user123', 10);

      // Création des utilisateurs
      const users = await User.bulkCreate([
        { username: 'admin', email: 'admin@example.com', password: hashedAdminPassword, role: 'admin', totalPoints: 0 },
        { username: 'user1', email: 'user1@example.com', password: hashedUserPassword, role: 'user', totalPoints: 0 },
        { username: 'user2', email: 'user2@example.com', password: hashedUserPassword, role: 'user', totalPoints: 0 }
      ]);
      console.log('Utilisateurs créés');

      // Création des équipes
      const teams = await Team.bulkCreate([
        // Conférence Est
        { name: 'Boston Celtics', conference: 'East', seed: 1 },
        { name: 'New York Knicks', conference: 'East', seed: 2 },
        { name: 'Milwaukee Bucks', conference: 'East', seed: 3 },
        { name: 'Cleveland Cavaliers', conference: 'East', seed: 4 },
        { name: 'Orlando Magic', conference: 'East', seed: 5 },
        { name: 'Indiana Pacers', conference: 'East', seed: 6 },
        { name: 'Philadelphia 76ers', conference: 'East', seed: 7 },
        { name: 'Miami Heat', conference: 'East', seed: 8 },

        // Conférence Ouest
        { name: 'Oklahoma City Thunder', conference: 'West', seed: 1 },
        { name: 'Denver Nuggets', conference: 'West', seed: 2 },
        { name: 'Minnesota Timberwolves', conference: 'West', seed: 3 },
        { name: 'LA Clippers', conference: 'West', seed: 4 },
        { name: 'Dallas Mavericks', conference: 'West', seed: 5 },
        { name: 'Phoenix Suns', conference: 'West', seed: 6 },
        { name: 'New Orleans Pelicans', conference: 'West', seed: 7 },
        { name: 'Los Angeles Lakers', conference: 'West', seed: 8 }
      ]);
      console.log('Équipes créées');

      // Création des séries du premier tour
      const series = await Series.bulkCreate([
        // Premier tour Est
        { Team1Id: teams[0].id, Team2Id: teams[7].id, round: 1, conference: 'East' },
        { Team1Id: teams[1].id, Team2Id: teams[6].id, round: 1, conference: 'East' },
        { Team1Id: teams[2].id, Team2Id: teams[5].id, round: 1, conference: 'East' },
        { Team1Id: teams[3].id, Team2Id: teams[4].id, round: 1, conference: 'East' },

        // Premier tour Ouest
        { Team1Id: teams[8].id, Team2Id: teams[15].id, round: 1, conference: 'West' },
        { Team1Id: teams[9].id, Team2Id: teams[14].id, round: 1, conference: 'West' },
        { Team1Id: teams[10].id, Team2Id: teams[13].id, round: 1, conference: 'West' },
        { Team1Id: teams[11].id, Team2Id: teams[12].id, round: 1, conference: 'West' }
      ]);
      console.log('Séries créées');

      // Création des matchs pour la première série
      const games = await Game.bulkCreate([
        // Matchs Celtics vs Heat
        { SeriesId: series[0].id, gameNumber: 1, date: '2024-04-20', HomeTeamId: teams[0].id, AwayTeamId: teams[7].id, status: 'scheduled' },
        { SeriesId: series[0].id, gameNumber: 2, date: '2024-04-23', HomeTeamId: teams[0].id, AwayTeamId: teams[7].id, status: 'scheduled' },
        { SeriesId: series[0].id, gameNumber: 3, date: '2024-04-27', HomeTeamId: teams[7].id, AwayTeamId: teams[0].id, status: 'scheduled' },
        { SeriesId: series[0].id, gameNumber: 4, date: '2024-04-29', HomeTeamId: teams[7].id, AwayTeamId: teams[0].id, status: 'scheduled' }
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
