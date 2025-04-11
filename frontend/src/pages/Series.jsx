import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import api from '../config/axios';

function Series() {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [existingBet, setExistingBet] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setIsAdmin(user?.role === 'admin');
  }, []);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await api.get(`/series/${seriesId}`);
        setSeries(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement de la série:', err);
        setError('Erreur lors du chargement de la série');
        setLoading(false);
      }
    };

    fetchSeries();
  }, [seriesId]);

  const handleBet = async () => {
    try {
      const token = localStorage.getItem('token');
      if (existingBet) {
        // Modification d'un pari existant
        await api.put(`/bets/games/${selectedGame.id}/bets`, {
          teamId: selectedTeam.id
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('Pari modifié avec succès !');
      } else {
        // Création d'un nouveau pari
        await api.post(`/bets/games/${selectedGame.id}/bets`, {
          teamId: selectedTeam.id
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('Pari placé avec succès !');
      }
      setSelectedGame(null);
      setSelectedTeam(null);
      setExistingBet(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur lors du pari', err);
      if (err.response?.data?.message === 'Vous avez déjà parié sur ce match') {
        setError('Vous avez déjà un pari en cours sur ce match');
      } else if (err.response?.data?.message === 'Impossible de modifier le pari car le match a déjà commencé') {
        setError('Impossible de modifier le pari car le match a déjà commencé');
      } else {
        setError('Erreur lors du placement du pari');
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleGameClick = async (game) => {
    setSelectedGame(game);
    setSelectedTeam(null);
    setExistingBet(null);

    // Vérifier si l'utilisateur a déjà un pari sur ce match
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/bets/users/${JSON.parse(localStorage.getItem('user')).id}/bets`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const existingBet = response.data.find(bet => bet.GameId === game.id);
      if (existingBet) {
        setExistingBet(existingBet);
        setSelectedTeam(game.HomeTeamId === existingBet.TeamId ? game.HomeTeam : game.AwayTeam);
      }
    } catch (err) {
      console.error('Erreur lors de la vérification des paris existants:', err);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/series/${seriesId}/games/${gameId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess('Match supprimé avec succès');
      // Recharger les données de la série
      const response = await api.get(`/series/${seriesId}`);
      setSeries(response.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur lors de la suppression du match:', err);
      setError('Erreur lors de la suppression du match');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteSeries = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette série ? Cette action est irréversible.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/series/${seriesId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess('Série supprimée avec succès');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la suppression de la série:', err);
      setError('Erreur lors de la suppression de la série');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {series.Team1.name} vs {series.Team2.name}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {series.round} - Conférence {series.conference}
          </Typography>
        </Box>
        {isAdmin && (
          <Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate(`/admin/series/${seriesId}/games`)}
              sx={{ mr: 2 }}
            >
              Gérer les matchs
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDeleteSeries()}
            >
              Supprimer la série
            </Button>
          </Box>
        )}
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Matchs" />
        <Tab label="Détails" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {series.Games.map((game) => (
            <Grid item xs={12} sm={6} md={4} key={game.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Match {game.gameNumber}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {game.HomeTeam.name} vs {game.AwayTeam.name}
                  </Typography>
                  {game.status === 'completed' ? (
                    <Typography variant="body2" color="text.secondary">
                      Score: {game.homeScore} - {game.awayScore}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {new Date(game.date).toLocaleDateString()}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleGameClick(game)}
                    >
                      {game.status === 'completed' ? 'Voir le résultat' : 'Parier'}
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteGame(game.id)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Statut de la série
          </Typography>
          <Typography variant="body1">
            {series.Team1.name}: {series.Team1Wins} victoires
          </Typography>
          <Typography variant="body1">
            {series.Team2.name}: {series.Team2Wins} victoires
          </Typography>
        </Box>
      )}

      <Dialog open={!!selectedGame} onClose={() => {
        setSelectedGame(null);
        setSelectedTeam(null);
        setExistingBet(null);
      }}>
        <DialogTitle>
          {existingBet ? 'Modifier votre pari' : 'Placer un pari'}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Sélectionnez l'équipe sur laquelle vous voulez parier :
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant={selectedTeam?.id === selectedGame?.HomeTeamId ? 'contained' : 'outlined'}
              onClick={() => setSelectedTeam(selectedGame?.HomeTeam)}
              sx={{ mr: 2 }}
            >
              {selectedGame?.HomeTeam.name}
            </Button>
            <Button
              variant={selectedTeam?.id === selectedGame?.AwayTeamId ? 'contained' : 'outlined'}
              onClick={() => setSelectedTeam(selectedGame?.AwayTeam)}
            >
              {selectedGame?.AwayTeam.name}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSelectedGame(null);
            setSelectedTeam(null);
            setExistingBet(null);
          }}>
            Annuler
          </Button>
          <Button
            onClick={handleBet}
            disabled={!selectedTeam}
            variant="contained"
            color="primary"
          >
            {existingBet ? 'Modifier le pari' : 'Confirmer le pari'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Series;
