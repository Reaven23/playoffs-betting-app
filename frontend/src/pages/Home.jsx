import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Container,
  Button,
  ButtonGroup,
} from '@mui/material';
import api from '../config/axios';

function Home() {
  const navigate = useNavigate();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setIsAdmin(user?.role === 'admin');
  }, []);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        console.log('Fetching series...');
        const response = await api.get('/series');
        console.log('Series response:', response.data);

        // Vérifier que les données sont valides
        const validSeries = response.data.filter(serie =>
          serie &&
          typeof serie.team1Wins === 'number' &&
          typeof serie.team2Wins === 'number'
        );
        console.log('Valid series:', validSeries);

        setSeries(validSeries);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des séries:', err);
        setError('Erreur lors du chargement des séries');
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

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
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Séries en cours
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/admin/series')}
          >
            Créer une série
          </Button>
        )}
      </Box>
      <Grid container spacing={3}>
        {series.length === 0 ? (
          <Grid item xs={12}>
            <Typography>Aucune série en cours</Typography>
          </Grid>
        ) : (
          series.map((serie) => (
            <Grid item xs={12} sm={6} md={4} key={serie.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {serie.round === 1 ? 'Premier tour' :
                     serie.round === 2 ? 'Demi-finales de conférence' :
                     serie.round === 3 ? 'Finales de conférence' :
                     'Finales NBA'}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {serie.Team1?.name || 'Équipe 1'} vs {serie.Team2?.name || 'Équipe 2'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {serie.team1Wins} - {serie.team2Wins}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conférence: {serie.conference}
                  </Typography>
                  <ButtonGroup variant="contained" sx={{ mt: 2 }}>
                    <Button
                      component={Link}
                      to={`/series/${serie.id}`}
                    >
                      Voir les détails
                    </Button>
                    {isAdmin && (
                      <Button
                        component={Link}
                        to={`/admin/series/${serie.id}/games`}
                        color="secondary"
                      >
                        Gérer les matchs
                      </Button>
                    )}
                  </ButtonGroup>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

export default Home;
