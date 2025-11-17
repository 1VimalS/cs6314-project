import { useEffect, useState, React } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Switch, FormControlLabel } from '@mui/material';
import axios from 'axios';

import './styles.css';

function TopBar({ advancedEnabled, setAdvancedEnabled }) {
  // Hook to access the current route path
  const location = useLocation();
  // Text displayed on the right side of the top bar
  const [topBarText, setTopBarText] = useState('Click on any User Below!');

  useEffect(() => {
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
    if (userId) {
      // Fetch the user's information to display their name in the top bar
      axios.get(`http://localhost:3001/user/${userId}`)
      .then(res => {
        const user = res.data;
        // Display different text depending on whether we're viewing their photos or profile
        if (matchUserPhotos || matchUserPhotosWithIndex) {
          setTopBarText(`Photos of ${user.first_name} ${user.last_name}`);
        } else if (matchUserComments) {
          setTopBarText(`Comments by ${user.first_name} ${user.last_name}`);
        } else {
          setTopBarText(`${user.first_name} ${user.last_name}`);
        }
      })
      .catch(err => {
        console.error('Failed to fetch user:', err);
        setTopBarText('User not found');
      });
    } else {
      // Default message when no user is selected
      setTopBarText('Click on any User Below!');
    }
  }, [location.pathname]); // Re-run whenever the URL path changes

  return (
    // The top navigation bar with app name on the left and dynamic text on the right
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" color="inherit">
          Vimal Sebastian
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
          <Typography variant="h6" color="inherit">
            {topBarText}
          </Typography>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
