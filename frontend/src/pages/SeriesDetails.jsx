import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
} from '@mui/material';
import api from '../config/api';

function SeriesDetails() {
  const { seriesId } = useParams();
  const [series, setSeries] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      try {
        const [seriesResponse, gamesResponse] = await Promise.all([
          api.get(`/series/${seriesId}`),
          api.get(`/series/${seriesId}/games`),
        ]);
        setSeries(seriesResponse.data);
        setGames(gamesResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des détails de la série');
        setLoading(false);
      }
    };

    fetchSeriesDetails();
  }, [seriesId]);

  if (loading) {
    return (
      <Container>
        <Typography>Chargement...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!series) {
    return (
      <Container>
        <Typography>Série non trouvée</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {series.homeTeam.name} vs {series.awayTeam.name}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Conférence: {series.conference}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Score: {series.homeTeamWins} - {series.awayTeamWins}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {games.map((game) => (
          <Grid item xs={12} sm={6} md={4} key={game.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  Match {game.matchNumber}
                </Typography>
                <Typography color="text.secondary">
                  {new Date(game.date).toLocaleDateString()}
                </Typography>
                <Typography>
                  {game.homeTeam.name} vs {game.awayTeam.name}
                </Typography>
                {game.score && (
                  <Typography>
                    Score: {game.score.homeTeam} - {game.score.awayTeam}
                  </Typography>
                )}
                <Typography color="text.secondary">
                  Statut: {game.status}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default SeriesDetails;
