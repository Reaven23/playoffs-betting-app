import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import api from '../config/axios';

function MyBets() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBets: 0,
    wonBets: 0,
    lostBets: 0,
    pendingBets: 0,
    totalPoints: 0
  });

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        const response = await api.get(`/bets/users/${user.id}/bets`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBets(response.data);

        // Calculer les statistiques
        const stats = {
          totalBets: response.data.length,
          wonBets: response.data.filter(bet => bet.status === 'won').length,
          lostBets: response.data.filter(bet => bet.status === 'lost').length,
          pendingBets: response.data.filter(bet => bet.status === 'pending').length,
          totalPoints: response.data.reduce((sum, bet) => sum + (bet.points || 0), 0)
        };
        setStats(stats);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des paris:', err);
        setError('Erreur lors du chargement des paris');
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'won':
        return 'success';
      case 'lost':
        return 'error';
      default:
        return 'default';
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
      <Typography variant="h4" gutterBottom>
        Mes Paris
      </Typography>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Mes Statistiques
            </Typography>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Total des paris</TableCell>
                    <TableCell align="right">{stats.totalBets}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Paris gagnés</TableCell>
                    <TableCell align="right">{stats.wonBets}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Paris perdus</TableCell>
                    <TableCell align="right">{stats.lostBets}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Paris en attente</TableCell>
                    <TableCell align="right">{stats.pendingBets}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Total des points</strong></TableCell>
                    <TableCell align="right"><strong>{stats.totalPoints}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Taux de réussite
            </Typography>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h3">
                {stats.totalBets > 0
                  ? `${Math.round((stats.wonBets / (stats.wonBets + stats.lostBets)) * 100)}%`
                  : '0%'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Basé sur les paris terminés
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Liste des paris */}
      <Typography variant="h5" gutterBottom>
        Historique des paris
      </Typography>
      <Grid container spacing={3}>
        {bets.map((bet) => (
          <Grid item xs={12} sm={6} md={4} key={bet.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {bet.game?.homeTeam?.name || 'Équipe à domicile'} vs {bet.game?.awayTeam?.name || 'Équipe à l\'extérieur'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Match {bet.game?.gameNumber || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Pari sur: {bet.team || 'Équipe inconnue'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={bet.status === 'pending' ? 'En attente' : bet.status === 'won' ? 'Gagné' : 'Perdu'}
                    color={getStatusColor(bet.status)}
                  />
                  {bet.status !== 'pending' && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Points: {bet.points || 0}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default MyBets;
