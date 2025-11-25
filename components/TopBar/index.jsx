import { useEffect, useState, React } from 'react';
import { useLocation, matchPath, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Switch, FormControlLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUser, logout, uploadPhoto, deleteUserAccount } from '../../api';
import useAppStore from '../../store/useAppStore';

import './styles.css';

function TopBar() {
  // Access global state and actions from the app store
  const { advancedEnabled, setAdvancedEnabled, currentUser, clearCurrentUser } = useAppStore();
  // React Query client for cache management
  const queryClient = useQueryClient();

  // Hook to access the current route path
  const location = useLocation();
  const navigate = useNavigate();
  // Text displayed on the right side of the top bar
  const [topBarText, setTopBarText] = useState('Click on any User Below!');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');


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

  // photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: uploadPhoto,
    onSuccess: () => {
      if (currentUser) {
        queryClient.invalidateQueries({ queryKey: ['photosOfUser', currentUser._id] });
        queryClient.invalidateQueries({ queryKey: ['userCounts'] });
      }
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadError('');
      if (currentUser) {
        navigate(`/photos/${currentUser._id}`);
      }
    },
    onError: (error) => {
      if (error.response && error.response.status === 400) {
        setUploadError(error.response.data?.error || 'Failed to upload photo');
      } else {
        setUploadError('An error occurred while uploading the photo');
      }
    },
  });

  // delete user account mutation
  const deleteUserMutation = useMutation({
    mutationFn: () => deleteUserAccount(currentUser._id),
    onSuccess: () => {
      // Clear all client-side state
      clearCurrentUser();
      queryClient.clear();
      setAdvancedEnabled(false);
      navigate('/');
    },
    onError: (error) => {
      console.error('Error deleting account:', error);
      // You can show an Alert/snackbar if you like
    },
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadError('');
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      uploadPhotoMutation.mutate(null);
      return;
    }
    uploadPhotoMutation.mutate(selectedFile);
  };

  const handleCloseDialog = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadError('');
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
                onClick={() => setUploadDialogOpen(true)}
                sx={{ ml: 1 }}
              >
                Add Photo
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                onClick={handleLogout}
                sx={{ ml: 1 }}
              >
                Logout
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ ml: 1 }}
              >
                Delete Account
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

      <Dialog open={uploadDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Upload Photo</DialogTitle>
        <DialogContent>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ marginTop: '1rem' }}
          />
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploadPhotoMutation.isPending}
          >
            {uploadPhotoMutation.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This will permanently delete your account, all of your photos,
            and all comments you have authored. This action cannot be undone.
            Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              deleteUserMutation.mutate();
              setDeleteDialogOpen(false);
            }}
            color="error"
            variant="contained"
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? 'Deleting...' : 'Yes, delete my account'}
          </Button>
        </DialogActions>
      </Dialog>

    </AppBar>
  );
}

export default TopBar;
