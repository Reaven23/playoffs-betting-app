const express = require('express');
const router = express.Router();
const { Bet, Game, Team, User } = require('../models');
const { auth } = require('../middleware/auth');

// Récupérer les paris d'un utilisateur
router.get('/users/:userId/bets', auth, async (req, res) => {
  try {
    const bets = await Bet.findAll({
      where: { UserId: req.params.userId },
      include: [
        {
          model: Game,
          include: [
            { model: Team, as: 'HomeTeam' },
            { model: Team, as: 'AwayTeam' }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Formater les paris pour inclure toutes les informations nécessaires
    const formattedBets = bets.map(bet => ({
      id: bet.id,
      gameId: bet.GameId,
      teamId: bet.TeamId,
      status: bet.status,
      points: bet.points,
      team: bet.team,
      game: {
        id: bet.Game.id,
        gameNumber: bet.Game.gameNumber,
        date: bet.Game.date,
        status: bet.Game.status,
        winnerId: bet.Game.winnerId,
        homeTeam: {
          id: bet.Game.HomeTeam.id,
          name: bet.Game.HomeTeam.name
        },
        awayTeam: {
          id: bet.Game.AwayTeam.id,
          name: bet.Game.AwayTeam.name
        }
      }
    }));

    console.log('Pris récupérés pour l\'utilisateur:', {
      userId: req.params.userId,
      count: formattedBets.length,
      bets: formattedBets
    });

    res.json(formattedBets);
  } catch (error) {
    console.error('Erreur détaillée lors de la récupération des paris:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des paris',
      error: error.message,
      stack: error.stack
    });
  }
});

// Placer un pari
router.post('/games/:gameId/bets', auth, async (req, res) => {
  try {
    console.log('Requête de pari reçue:', {
      body: req.body,
      params: req.params,
      user: req.user
    });

    const { teamId } = req.body;
    console.log('Données reçues pour la création du pari:', {
      teamId,
      type: typeof teamId,
      isNaN: isNaN(teamId),
      parsed: parseInt(teamId)
    });

    if (!teamId) {
      console.error('teamId manquant dans la requête');
      return res.status(400).json({ message: 'teamId est requis' });
    }

    // Convertir teamId en nombre si nécessaire
    const numericTeamId = typeof teamId === 'string' ? parseInt(teamId) : teamId;
    console.log('teamId converti:', numericTeamId);

    // Vérifier si le match existe
    const game = await Game.findByPk(req.params.gameId);
    if (!game) {
      console.error('Match non trouvé:', req.params.gameId);
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    // Vérifier si l'équipe sélectionnée fait partie du match
    if (game.HomeTeamId !== numericTeamId && game.AwayTeamId !== numericTeamId) {
      console.error('Équipe invalide pour ce match:', {
        teamId: numericTeamId,
        homeTeamId: game.HomeTeamId,
        awayTeamId: game.AwayTeamId
      });
      return res.status(400).json({ message: 'L\'équipe sélectionnée ne fait pas partie de ce match' });
    }

    // Récupérer le nom de l'équipe
    const team = await Team.findByPk(numericTeamId);
    if (!team) {
      console.error('Équipe non trouvée:', numericTeamId);
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    const existingBet = await Bet.findOne({
      where: {
        UserId: req.user.id,
        GameId: req.params.gameId
      }
    });

    if (existingBet) {
      console.log('Pari existant trouvé:', existingBet);
      return res.status(400).json({ message: 'Vous avez déjà parié sur ce match' });
    }

    const bet = await Bet.create({
      teamId: numericTeamId,
      team: team.name,
      UserId: req.user.id,
      GameId: req.params.gameId,
      status: 'pending',
      points: 0
    });

    // Vérifier que le pari a été correctement créé
    const createdBet = await Bet.findByPk(bet.id, {
      include: [{ model: Team }]
    });

    // Vérifier que le teamId a été correctement enregistré
    if (!createdBet.teamId) {
      console.error('Erreur: teamId non enregistré pour le pari:', createdBet);
      // Tenter de corriger le pari
      await createdBet.update({ teamId: numericTeamId });
      console.log('Pari corrigé avec le teamId:', numericTeamId);
    }

    console.log('Pari créé avec succès:', {
      id: createdBet.id,
      teamId: createdBet.teamId,
      team: createdBet.team,
      status: createdBet.status,
      points: createdBet.points,
      gameId: createdBet.GameId,
      userId: createdBet.UserId
    });

    // Mettre à jour le statut du pari si le match est déjà terminé
    if (game.status === 'completed' && game.winnerId) {
      const isWinner = createdBet.teamId === game.winnerId;
      await createdBet.update({
        status: isWinner ? 'won' : 'lost',
        points: isWinner ? 10 : -5
      });
      console.log('Pari mis à jour après création:', {
        id: createdBet.id,
        status: createdBet.status,
        points: createdBet.points
      });
    }

    res.status(201).json(createdBet);
  } catch (error) {
    console.error('Erreur détaillée lors de la création du pari:', error);
    res.status(500).json({
      message: 'Erreur lors de la création du pari',
      error: error.message,
      stack: error.stack
    });
  }
});

// Modifier un pari existant
router.put('/games/:gameId/bets', auth, async (req, res) => {
  try {
    console.log('Requête de modification de pari reçue:', {
      body: req.body,
      params: req.params,
      user: req.user
    });

    const { teamId } = req.body;
    if (!teamId) {
      console.error('teamId manquant dans la requête');
      return res.status(400).json({ message: 'teamId est requis' });
    }

    const existingBet = await Bet.findOne({
      where: {
        UserId: req.user.id,
        GameId: req.params.gameId
      }
    });

    if (!existingBet) {
      console.log('Pari non trouvé');
      return res.status(404).json({ message: 'Pari non trouvé' });
    }

    // Vérifier si le match n'a pas encore commencé
    const game = await Game.findByPk(req.params.gameId);
    if (game.status !== 'pending') {
      return res.status(400).json({ message: 'Impossible de modifier le pari car le match a déjà commencé' });
    }

    await existingBet.update({
      teamId,
      status: 'pending'
    });

    console.log('Pari modifié avec succès:', existingBet);
    res.json(existingBet);
  } catch (error) {
    console.error('Erreur détaillée lors de la modification du pari:', error);
    res.status(500).json({
      message: 'Erreur lors de la modification du pari',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
