import { useEffect, useState, React } from 'react';
import { useLocation, matchPath, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Switch, FormControlLabel, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchUser, logout } from '../../api';
import useAppStore from '../../store/useAppStore';

import './styles.css';

function TopBar() {
  // Hook to access the current route path
  const location = useLocation();
  const navigate = useNavigate();
  // Text displayed on the right side of the top bar
  const [topBarText, setTopBarText] = useState('Click on any User Below!');

  const { advancedEnabled, setAdvancedEnabled, currentUser, setCurrentUser, clearCurrentUser } = useAppStore();

  // Check if the current route matches a user detail or user photos path
  const matchUserDetail = matchPath('/users/:userId', location.pathname);
  const matchUserPhotos = matchPath('/photos/:userId', location.pathname);
  const matchUserPhotosWithIndex = matchPath('/photos/:userId/:index', location.pathname);
  const matchUserComments = matchPath('/comments/:userId', location.pathname);
  // Extract userId from whichever route matched
  const userId =
    (matchUserDetail && matchUserDetail.params.userId) ||
    (matchUserPhotos && matchUserPhotos.params.userId) ||
    (matchUserPhotosWithIndex && matchUserPhotosWithIndex.params.userId) ||
    (matchUserComments && matchUserComments.params.userId);

  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) {
      setTopBarText('Click on any User Below!');
      return;
    }
    if (!user) return; // still loading

    if (matchUserPhotos || matchUserPhotosWithIndex) {
      setTopBarText(`Photos of ${user.first_name} ${user.last_name}`);
    } else if (matchUserComments) {
      setTopBarText(`Comments by ${user.first_name} ${user.last_name}`);
    } else {
      setTopBarText(`${user.first_name} ${user.last_name}`);
    }
  }, [location.pathname, userId, user, matchUserPhotos, matchUserPhotosWithIndex, matchUserComments]);

  const handleLogout = async () => {
    try {
      await logout();
      clearCurrentUser();
      navigate('/');
    } catch (err) {
      console.error('Error logging out:', err);
      clearCurrentUser();
      navigate('/');
    }
  };

  return (
    // The top navigation bar with app name on the left and dynamic text on the right
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" color="inherit">
          Vimal Sebastian
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {currentUser ? (
            <>
              <Typography variant="h6" color="inherit">
                Hi {currentUser.first_name}
              </Typography>
              <Button
                color="inherit"
                variant="outlined"
                onClick={handleLogout}
                sx={{ ml: 1 }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Typography variant="h6" color="inherit">
              Please Login
            </Typography>
          )}
          {currentUser && (
            <FormControlLabel
              control={(
                <Switch
                  checked={!!advancedEnabled}
                  onChange={(e) => setAdvancedEnabled && setAdvancedEnabled(e.target.checked)}
                  color="default"
                  inputProps={{ 'aria-label': 'advanced-features-toggle' }}
                  sx={{
                    '& .MuiSwitch-track': {
                      backgroundColor: advancedEnabled ? '#ff0000ff' : '#ffffffff',
                    },
                    '& .MuiSwitch-thumb': {
                      backgroundColor: advancedEnabled ? '#ffffff' : '#9e9e9e',
                    },
                  }}
                />
              )}
              label="Advanced Features"
            />
          )}
          {currentUser && (
            <Typography variant="h6" color="inherit">
              {topBarText}
            </Typography>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
