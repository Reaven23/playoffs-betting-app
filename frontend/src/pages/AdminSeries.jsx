import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import api from '../config/axios';

const AdminSeries = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newSeries, setNewSeries] = useState({
    Team1Id: '',
    Team2Id: '',
    round: 1,
    conference: 'East'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seriesRes, teamsRes] = await Promise.all([
          api.get('/series'),
          api.get('/teams')
        ]);
        setSeries(seriesRes.data);
        setTeams(teamsRes.data);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/series', newSeries);
      setSeries([...series, response.data]);
      setNewSeries({
        Team1Id: '',
        Team2Id: '',
        round: 1,
        conference: 'East'
      });
      setSuccess('Série créée avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la série');
    }
  };

  const handleCreateGames = async (seriesId) => {
    try {
      // Créer 7 matchs pour la série
      const games = [];
      const seriesData = series.find(s => s.id === seriesId);

      for (let i = 1; i <= 7; i++) {
        const isHomeGame = i <= 4 ? i % 2 === 1 : i % 2 === 0;
        const homeTeamId = isHomeGame ? seriesData.Team1Id : seriesData.Team2Id;
        const awayTeamId = isHomeGame ? seriesData.Team2Id : seriesData.Team1Id;

        const gameDate = new Date();
        gameDate.setDate(gameDate.getDate() + (i - 1) * 2); // Un match tous les 2 jours

        const game = await api.post(`/series/${seriesId}/games`, {
          gameNumber: i,
          date: gameDate.toISOString().split('T')[0],
          homeTeamId,
          awayTeamId
        });
        games.push(game.data);
      }

      setSuccess('7 matchs créés avec succès pour la série');
      setTimeout(() => setSuccess(''), 3000);
      navigate(`/admin/series/${seriesId}/games`);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création des matchs');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des séries
      </Typography>

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

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Créer une nouvelle série
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Équipe 1</InputLabel>
                <Select
                  value={newSeries.Team1Id}
                  onChange={(e) => setNewSeries({ ...newSeries, Team1Id: e.target.value })}
                  required
                >
                  {teams.map(team => (
                    <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Équipe 2</InputLabel>
                <Select
                  value={newSeries.Team2Id}
                  onChange={(e) => setNewSeries({ ...newSeries, Team2Id: e.target.value })}
                  required
                >
                  {teams.map(team => (
                    <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tour</InputLabel>
                <Select
                  value={newSeries.round}
                  onChange={(e) => setNewSeries({ ...newSeries, round: e.target.value })}
                  required
                >
                  <MenuItem value={1}>Premier tour</MenuItem>
                  <MenuItem value={2}>Demi-finales de conférence</MenuItem>
                  <MenuItem value={3}>Finales de conférence</MenuItem>
                  <MenuItem value={4}>Finales NBA</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Conférence</InputLabel>
                <Select
                  value={newSeries.conference}
                  onChange={(e) => setNewSeries({ ...newSeries, conference: e.target.value })}
                  required
                >
                  <MenuItem value="East">Est</MenuItem>
                  <MenuItem value="West">Ouest</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Créer la série
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Séries existantes
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tour</TableCell>
              <TableCell>Conférence</TableCell>
              <TableCell>Équipe 1</TableCell>
              <TableCell>Équipe 2</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {series.map((serie) => (
              <TableRow key={serie.id}>
                <TableCell>{serie.round}</TableCell>
                <TableCell>{serie.conference}</TableCell>
                <TableCell>{teams.find(t => t.id === serie.Team1Id)?.name}</TableCell>
                <TableCell>{teams.find(t => t.id === serie.Team2Id)?.name}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleCreateGames(serie.id)}
                    sx={{ mr: 1 }}
                  >
                    Créer les matchs
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate(`/admin/series/${serie.id}/games`)}
                  >
                    Gérer les matchs
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminSeries;
