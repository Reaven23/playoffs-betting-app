import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Home from './pages/Home';
import Series from './pages/Series';
import Leaderboard from './pages/Leaderboard';
import MyBets from './pages/MyBets';
import Login from './pages/Login';
import AdminSeries from './pages/AdminSeries';
import AdminGames from './pages/AdminGames';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1a73e8',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const PrivateRoute = ({ children, adminOnly = false }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin/series"
              element={
                <PrivateRoute adminOnly>
                  <AdminSeries />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/series/:seriesId/games"
              element={
                <PrivateRoute adminOnly>
                  <AdminGames />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Home />} />
            <Route path="/series/:seriesId" element={<Series />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/my-bets" element={<MyBets />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
