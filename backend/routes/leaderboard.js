const express = require('express');
const router = express.Router();
const { User } = require('../models');

router.get('/leaderboard', async (req, res) => {
  try {
    console.log("hello");

    const users = await User.findAll({
      order: [['totalPoints', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Utilisateurs non trouvés', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des paris',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
