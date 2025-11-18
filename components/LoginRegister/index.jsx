import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { login } from '../../api';
import useAppStore from '../../store/useAppStore';
import './styles.css';

function LoginRegister() {
  const [loginName, setLoginName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useAppStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(loginName);
      setCurrentUser(user);
      navigate(`/users/${user._id}`);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError('Invalid login name. Please try again.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="login-register-container">
      <Card variant="outlined" sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Login Name"
              variant="outlined"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              required
              disabled={isLoading}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isLoading || !loginName.trim()}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          {/* Registration will be added in Problem 4 */}
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginRegister;

