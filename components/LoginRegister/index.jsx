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
  Divider,
} from '@mui/material';
import { login, register } from '../../api';
import useAppStore from '../../store/useAppStore';
import './styles.css';

function LoginRegister() {
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regLoginName, setRegLoginName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regLocation, setRegLocation] = useState('');
  const [regDescription, setRegDescription] = useState('');
  const [regOccupation, setRegOccupation] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const navigate = useNavigate();
  const { setCurrentUser } = useAppStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const user = await login(loginName, loginPassword);
      setCurrentUser(user);
      navigate(`/users/${user._id}`);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data?.error || 'Invalid login name or password. Please try again.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (regPassword !== regPasswordConfirm) {
      setError('Passwords do not match');
      return;
    }

    setIsRegistering(true);

    try {
      const userData = {
        login_name: regLoginName,
        password: regPassword,
        first_name: regFirstName,
        last_name: regLastName,
        location: regLocation,
        description: regDescription,
        occupation: regOccupation,
      };

      await register(userData);

      setSuccess('Registration successful! You can now login.');
      setRegLoginName('');
      setRegPassword('');
      setRegPasswordConfirm('');
      setRegFirstName('');
      setRegLastName('');
      setRegLocation('');
      setRegDescription('');
      setRegOccupation('');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        const errorMsg = typeof err.response.data === 'string'
          ? err.response.data
          : (err.response.data?.error || 'Registration failed. Please check your input and try again.');
        setError(errorMsg);
      } else {
        setError('An error occurred during registration. Please try again.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Box className="login-register-container">
      <Card variant="outlined" sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
        <CardContent>
          {/* Login Section */}
          <Typography variant="h5" gutterBottom align="center">
            Login
          </Typography>
          {(error || success) && (
            <Alert
              severity={error ? 'error' : 'success'}
              sx={{ mb: 2 }}
              onClose={() => { setError(''); setSuccess(''); }}
            >
              {error || success}
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
              disabled={isLoading || isRegistering}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              disabled={isLoading || isRegistering}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isLoading || isRegistering || !loginName.trim() || !loginPassword.trim()}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Divider sx={{ my: 4 }} />

          {/* Registration Section */}
          <Typography variant="h5" gutterBottom align="center">
            Register
          </Typography>
          <form onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="Login Name"
              variant="outlined"
              value={regLoginName}
              onChange={(e) => setRegLoginName(e.target.value)}
              required
              disabled={isLoading || isRegistering}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
              disabled={isLoading || isRegistering}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              variant="outlined"
              value={regPasswordConfirm}
              onChange={(e) => setRegPasswordConfirm(e.target.value)}
              required
              disabled={isLoading || isRegistering}
              error={regPasswordConfirm !== '' && regPassword !== regPasswordConfirm}
              helperText={regPasswordConfirm !== '' && regPassword !== regPasswordConfirm ? 'Passwords do not match' : ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="First Name"
              variant="outlined"
              value={regFirstName}
              onChange={(e) => setRegFirstName(e.target.value)}
              required
              disabled={isLoading || isRegistering}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Last Name"
              variant="outlined"
              value={regLastName}
              onChange={(e) => setRegLastName(e.target.value)}
              required
              disabled={isLoading || isRegistering}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Location"
              variant="outlined"
              value={regLocation}
              onChange={(e) => setRegLocation(e.target.value)}
              disabled={isLoading || isRegistering}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Occupation"
              variant="outlined"
              value={regOccupation}
              onChange={(e) => setRegOccupation(e.target.value)}
              disabled={isLoading || isRegistering}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              multiline
              rows={3}
              value={regDescription}
              onChange={(e) => setRegDescription(e.target.value)}
              disabled={isLoading || isRegistering}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isLoading || isRegistering || !regLoginName.trim() || !regPassword.trim() || !regPasswordConfirm.trim() || !regFirstName.trim() || !regLastName.trim() || regPassword !== regPasswordConfirm}
            >
              {isRegistering ? 'Registering...' : 'Register Me'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginRegister;

