const sequelize = require('../config/database');
const path = require('path');
const fs = require('fs');

const resetDatabase = async () => {
  try {
    // Supprimer le fichier de base de données s'il existe
    const dbPath = path.join(__dirname, '../database.sqlite');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Base de données supprimée');
    }

    // Synchroniser les modèles pour recréer la base de données
    await sequelize.sync({ force: true });
    console.log('Base de données recréée avec succès');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de la base de données:', error);
  } finally {
    await sequelize.close();
  }
};

resetDatabase();
