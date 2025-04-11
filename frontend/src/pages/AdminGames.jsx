import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import api from '../config/axios';

const AdminGames = () => {
  const { seriesId } = useParams();
  const [series, setSeries] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newGame, setNewGame] = useState({
    gameNumber: '',
    date: '',
    homeTeamId: '',
    awayTeamId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const seriesRes = await api.get(`/series/${seriesId}`);
        console.log('Series data:', seriesRes.data);
        setSeries(seriesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
      }
    };
    fetchData();
  }, [seriesId]);

  const handleUpdateGame = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/series/${seriesId}/games/${selectedGame.id}`, {
        winnerId: selectedTeam.id,
        status: 'completed'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess('Match mis à jour avec succès');
      setSelectedGame(null);
      setSelectedTeam(null);
      // Recharger les données
      const seriesRes = await api.get(`/series/${seriesId}`);
      setSeries(seriesRes.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du match:', err);
      setError('Erreur lors de la mise à jour du match');
      setTimeout(() => setError(''), 3000);
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
      // Recharger les données
      const seriesRes = await api.get(`/series/${seriesId}`);
      setSeries(seriesRes.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur lors de la suppression du match:', err);
      setError('Erreur lors de la suppression du match');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCreateGame = async () => {
    try {
      // Vérifier que tous les champs sont remplis
      if (!newGame.gameNumber || !newGame.date || !newGame.homeTeamId || !newGame.awayTeamId) {
        setError('Tous les champs sont requis');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const token = localStorage.getItem('token');
      await api.post(`/series/${seriesId}/games`, {
        ...newGame,
        date: newGame.date
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Recharger les données
      const seriesRes = await api.get(`/series/${seriesId}`);
      setSeries(seriesRes.data);

      setSuccess('Match créé avec succès');
      setTimeout(() => setSuccess(''), 3000);

      // Réinitialiser le formulaire et fermer la boîte de dialogue
      setNewGame({
        gameNumber: '',
        date: '',
        homeTeamId: '',
        awayTeamId: ''
      });
      setOpen(false);
    } catch (err) {
      console.error('Erreur lors de la création du match:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création du match');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!series) {
    return (
      <Container>
        <Typography>Chargement...</Typography>
      </Container>
    );
  }

  // Trouver les équipes de la série
  const seriesTeams = [series.Team1, series.Team2];

  console.log('Series teams:', seriesTeams);
  console.log('Series:', series);

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
        <Typography variant="h4">
          Gestion des matchs - {series.Team1.name} vs {series.Team2.name}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
        >
          Ajouter un match
        </Button>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Ajouter un nouveau match</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Numéro du match"
              type="number"
              value={newGame.gameNumber}
              onChange={(e) => setNewGame({ ...newGame, gameNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={newGame.date}
              onChange={(e) => setNewGame({ ...newGame, date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Équipe à domicile
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={newGame.homeTeamId === series.Team1.id ? 'contained' : 'outlined'}
                    onClick={() => setNewGame({ ...newGame, homeTeamId: series.Team1.id })}
                    fullWidth
                  >
                    {series.Team1.name}
                  </Button>
                  <Button
                    variant={newGame.homeTeamId === series.Team2.id ? 'contained' : 'outlined'}
                    onClick={() => setNewGame({ ...newGame, homeTeamId: series.Team2.id })}
                    fullWidth
                  >
                    {series.Team2.name}
                  </Button>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Équipe à l'extérieur
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={newGame.awayTeamId === series.Team1.id ? 'contained' : 'outlined'}
                    onClick={() => setNewGame({ ...newGame, awayTeamId: series.Team1.id })}
                    fullWidth
                  >
                    {series.Team1.name}
                  </Button>
                  <Button
                    variant={newGame.awayTeamId === series.Team2.id ? 'contained' : 'outlined'}
                    onClick={() => setNewGame({ ...newGame, awayTeamId: series.Team2.id })}
                    fullWidth
                  >
                    {series.Team2.name}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            onClick={handleCreateGame}
            variant="contained"
            disabled={!newGame.gameNumber || !newGame.date || !newGame.homeTeamId || !newGame.awayTeamId}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3}>
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
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {new Date(game.date).toLocaleDateString()}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={game.status === 'completed' ? 'Terminé' : 'À venir'}
                    color={game.status === 'completed' ? 'success' : 'default'}
                    sx={{ mr: 1 }}
                  />
                  {game.status === 'completed' && (
                    <Chip
                      label={`Gagnant: ${game.winnerId === game.HomeTeamId ? game.HomeTeam.name : game.AwayTeam.name}`}
                      color="primary"
                    />
                  )}
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  {game.status !== 'completed' && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setSelectedGame(game)}
                    >
                      Définir le gagnant
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteGame(game.id)}
                  >
                    Supprimer
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog pour définir le gagnant */}
      <Dialog open={!!selectedGame} onClose={() => setSelectedGame(null)}>
        <DialogTitle>Définir le gagnant du match</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {seriesTeams.map((team) => (
              <Button
                key={team.id}
                variant={selectedTeam?.id === team.id ? 'contained' : 'outlined'}
                onClick={() => setSelectedTeam(team)}
                sx={{ mb: 1 }}
              >
                {team.name}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedGame(null)}>Annuler</Button>
          <Button
            onClick={handleUpdateGame}
            disabled={!selectedTeam}
            variant="contained"
            color="primary"
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminGames;
