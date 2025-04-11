const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const seriesRoutes = require('./routes/series');
const betsRoutes = require('./routes/bets');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/bets', betsRoutes);

module.exports = app;
