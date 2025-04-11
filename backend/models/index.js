const User = require('./User');
const Bet = require('./Bet');
const Series = require('./Series');
const Game = require('./Game');
const Team = require('./Team');

// Relations User-Bet
User.hasMany(Bet);
Bet.belongsTo(User);

// Relations Series-Team
Series.belongsTo(Team, { as: 'Team1', foreignKey: 'Team1Id' });
Series.belongsTo(Team, { as: 'Team2', foreignKey: 'Team2Id' });
Team.hasMany(Series, { as: 'SeriesAsTeam1', foreignKey: 'Team1Id' });
Team.hasMany(Series, { as: 'SeriesAsTeam2', foreignKey: 'Team2Id' });

// Relations Series-Game
Series.hasMany(Game);
Game.belongsTo(Series);

// Relations Game-Team
Game.belongsTo(Team, { as: 'HomeTeam', foreignKey: 'HomeTeamId' });
Game.belongsTo(Team, { as: 'AwayTeam', foreignKey: 'AwayTeamId' });
Game.belongsTo(Team, { as: 'Winner', foreignKey: 'winnerId' });
Team.hasMany(Game, { as: 'HomeGames', foreignKey: 'HomeTeamId' });
Team.hasMany(Game, { as: 'AwayGames', foreignKey: 'AwayTeamId' });

// Relations Game-Bet
Game.hasMany(Bet);
Bet.belongsTo(Game);

// Relations Bet-Team
Bet.belongsTo(Team);
Team.hasMany(Bet);

module.exports = {
    User,
    Bet,
    Series,
    Game,
    Team
};
