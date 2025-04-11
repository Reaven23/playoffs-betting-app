const { Series, Game, Bet, User } = require('../models');
const sequelize = require('../config/database');

async function deleteAllSeriesAndGames() {
  try {
    console.log('Début de la suppression...');

    // Supprimer tous les paris (dépend de Game et User)
    console.log('Suppression des paris...');
    await Bet.destroy({ where: {}, truncate: true });

    // Réinitialiser les points des utilisateurs
    console.log('Réinitialisation des points des utilisateurs...');
    await User.update({ totalPoints: 0 }, { where: {} });

    // Supprimer tous les matchs (dépend de Series)
    console.log('Suppression des matchs...');
    await Game.destroy({ where: {}, truncate: true });

    // Supprimer toutes les séries
    console.log('Suppression des séries...');
    await Series.destroy({ where: {}, truncate: true });

    console.log('Suppression terminée avec succès !');
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
  } finally {
    // Fermer la connexion à la base de données
    await sequelize.close();
  }
}

// Exécuter le script
deleteAllSeriesAndGames();
