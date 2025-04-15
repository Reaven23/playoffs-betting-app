const express = require('express');
const router = express.Router();
const { Series, Game, Team, Bet, User } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// Récupérer toutes les séries
router.get('/', async (req, res) => {
  try {
    const series = await Series.findAll({
      include: [
        { model: Team, as: 'Team1' },
        { model: Team, as: 'Team2' }
      ]
    });
    res.json(series);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des séries' });
  }
});

// Récupérer une série par son ID
router.get('/:id', async (req, res) => {
  try {
    const series = await Series.findByPk(req.params.id, {
      include: [
        { model: Team, as: 'Team1' },
        { model: Team, as: 'Team2' },
        {
          model: Game,
          include: [
            { model: Team, as: 'HomeTeam' },
            { model: Team, as: 'AwayTeam' }
          ]
        }
      ]
    });
    if (!series) {
      return res.status(404).json({ message: 'Série non trouvée' });
    }
    res.json(series);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la série' });
  }
});

// Créer une nouvelle série (admin seulement)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { Team1Id, Team2Id, round, conference } = req.body;
    console.log('Création d\'une nouvelle série:', { Team1Id, Team2Id, round, conference });

    // Vérifier que les équipes existent
    const team1 = await Team.findByPk(Team1Id);
    const team2 = await Team.findByPk(Team2Id);

    if (!team1 || !team2) {
      return res.status(404).json({ message: 'Une ou plusieurs équipes n\'existent pas' });
    }

    const series = await Series.create({
      Team1Id,
      Team2Id,
      round,
      conference,
      Team1Wins: 0,
      Team2Wins: 0
    });

    // Récupérer la série avec les informations des équipes
    const seriesWithTeams = await Series.findByPk(series.id, {
      include: [
        { model: Team, as: 'Team1' },
        { model: Team, as: 'Team2' }
      ]
    });

    console.log('Série créée avec succès:', seriesWithTeams.toJSON());
    res.status(201).json(seriesWithTeams);
  } catch (err) {
    console.error('Erreur lors de la création de la série:', err);
    res.status(500).json({ message: 'Erreur lors de la création de la série' });
  }
});

// Récupérer les matchs d'une série
router.get('/:id/games', async (req, res) => {
  try {
    const games = await Game.findAll({
      where: { SeriesId: req.params.id },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ],
      order: [['gameNumber', 'ASC']]
    });
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des matchs' });
  }
});

// Créer un match pour une série (admin seulement)
router.post('/:id/games', auth, adminOnly, async (req, res) => {
  try {
    console.log('Tentative de création d\'un match:', {
      seriesId: req.params.id,
      body: req.body,
      user: req.user
    });

    const { gameNumber, date, homeTeamId, awayTeamId } = req.body;

    // Vérification des champs requis
    if (!gameNumber || !date || !homeTeamId || !awayTeamId) {
      return res.status(400).json({
        message: 'Tous les champs sont requis',
        missingFields: {
          gameNumber: !gameNumber,
          date: !date,
          homeTeamId: !homeTeamId,
          awayTeamId: !awayTeamId
        }
      });
    }

    // Vérifier que les équipes font partie de la série
    const series = await Series.findByPk(req.params.id);
    if (!series) {
      return res.status(404).json({ message: 'Série non trouvée' });
    }

    if (homeTeamId !== series.Team1Id && homeTeamId !== series.Team2Id) {
      return res.status(400).json({ message: 'L\'équipe à domicile ne fait pas partie de cette série' });
    }

    if (awayTeamId !== series.Team1Id && awayTeamId !== series.Team2Id) {
      return res.status(400).json({ message: 'L\'équipe à l\'extérieur ne fait pas partie de cette série' });
    }

    const game = await Game.create({
      gameNumber,
      date,
      HomeTeamId: homeTeamId,
      AwayTeamId: awayTeamId,
      SeriesId: req.params.id,
      status: 'scheduled'
    });

    console.log('Match créé avec succès:', game.toJSON());
    res.status(201).json(game);
  } catch (err) {
    console.error('Erreur détaillée lors de la création du match:', {
      error: err.message,
      stack: err.stack,
      body: req.body,
      seriesId: req.params.id
    });
    res.status(500).json({
      message: 'Erreur lors de la création du match',
      error: err.message
    });
  }
});

// Mettre à jour un match (admin seulement)
router.put('/:seriesId/games/:gameId', auth, adminOnly, async (req, res) => {
  try {
    const { seriesId, gameId } = req.params;
    const { winnerId, status } = req.body;

    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    // Mettre à jour le match
    console.log(req.body);

    const updatedGame = await game.update({
      winnerId,
      status
    });

    console.log(game);


    // Si le match est terminé, mettre à jour les paris
    if (status === 'completed' && winnerId) {
      // Récupérer tous les paris pour ce match
      const bets = await Bet.findAll({
        where: { gameId }
      });

      console.log(bets);

      // Mettre à jour chaque pari
      for (const bet of bets) {
        try {
          if (!bet.TeamId) {
            console.error('Pari sans teamId:', bet.id);
            continue;
          }

          // Déterminer le nouveau statut du pari
          const newStatus = bet.TeamId === winnerId ? 'won' : 'lost';
          const points = newStatus === 'won' ? 10 : -5;

          // Mettre à jour le pari
          await bet.update({
            status: newStatus,
            points: points
          });
          
          console.log("bet updated");
          console.log(bet);

          // Mettre à jour les points totaux de l'utilisateur
          const user = await User.findByPk(bet.userId);
          if (user) {
            const newTotalPoints = Math.max(0, user.totalPoints + points);
            await user.update({ totalPoints: newTotalPoints });
            console.log(`Pari ${bet.id} mis à jour: ${newStatus} (${points} points) - Utilisateur ${user.id}: ${newTotalPoints} points`);
          }
        } catch (err) {
          console.error('Erreur mise à jour pari:', err);
        }
      }
    }

    res.json(updatedGame);
  } catch (err) {
    console.error('Erreur mise à jour match:', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du match' });
  }
});

// Supprimer une série
router.delete('/:id', auth, async (req, res) => {
  try {
    const series = await Series.findByPk(req.params.id);
    if (!series) {
      return res.status(404).json({ message: 'Série non trouvée' });
    }

    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    await series.destroy();
    res.json({ message: 'Série supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la série:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la série' });
  }
});

// Supprimer un match
router.delete('/:seriesId/games/:gameId', auth, async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.gameId);
    if (!game) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    await game.destroy();
    res.json({ message: 'Match supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du match:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du match' });
  }
});

module.exports = router;
