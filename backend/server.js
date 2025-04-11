const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
const { User, Bet, Series, Game, Team } = require('./models');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const seriesRoutes = require('./routes/series');
const betsRoutes = require('./routes/bets');
const { auth, adminOnly } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes pour les séries
app.use('/api/series', seriesRoutes);

// Routes pour les paris
app.use('/api/bets', betsRoutes);

// Routes publiques
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Routes pour les équipes
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.findAll({
            order: [['conference', 'ASC'], ['seed', 'ASC']]
        });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/teams', async (req, res) => {
    try {
        const team = await Team.create(req.body);
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Synchroniser la base de données et démarrer le serveur
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
    });
}).catch(err => {
    console.error('Erreur lors de la synchronisation de la base de données:', err);
});
