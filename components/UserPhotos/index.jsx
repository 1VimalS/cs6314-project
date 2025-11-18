import { React, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Typography, Card, CardContent, CardMedia, Box, Divider, Link as MuiLink, IconButton, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchPhotosOfUser, fetchPhotoOfUserByIndex } from '../../api';
import useAppStore from '../../store/useAppStore';

import './styles.css';

function UserPhotos({ userId }) {
  const navigate = useNavigate();
  const params = useParams();
  const indexParam = params.index ? parseInt(params.index, 10) : null;

  const { advancedEnabled } = useAppStore();

  /**
   * Sync the route with the Advanced toggle:
   *  - If Advanced is ON and there is no index in the URL, go to /photos/:userId/1
   *  - If Advanced is OFF but URL has an index, go back to /photos/:userId
   */
  useEffect(() => {
    if (advancedEnabled && !indexParam) {
      navigate(`/photos/${userId}/1`, { replace: true });
    } else if (!advancedEnabled && indexParam) {
      navigate(`/photos/${userId}`, { replace: true });
    }
  }, [advancedEnabled, indexParam, userId, navigate]);

  // Non-advanced mode: fetch all photos of the user
  const { data: photos = [], isLoading: isLoadingPhotos, isError: isErrorPhotos } = useQuery({
    queryKey: ['photosOfUser', userId],
    queryFn: () => fetchPhotosOfUser(userId),
    enabled: !advancedEnabled && !!userId,
  });

  // Advanced mode: fetch single photo by index
  const { data: photo, isLoading: isLoadingPhoto, isError: isErrorPhoto } = useQuery({
    queryKey: ['photoOfUserByIndex', userId, indexParam],
    queryFn: () => fetchPhotoOfUserByIndex(userId, indexParam),
    enabled: advancedEnabled && !!userId && !!indexParam,
  });

  // For advanced mode, also fetch all photos to determine total count
  const { data: allPhotos = [], isLoading: isLoadingAllPhotos, isError: isErrorAllPhotos } = useQuery({
    queryKey: ['photosOfUser', userId],
    queryFn: () => fetchPhotosOfUser(userId),
    enabled: advancedEnabled && !!userId,
  });
  const totalPhotos = allPhotos.length;

  // Loading / error states
  if (!advancedEnabled) {
    if (isLoadingPhotos) return <Typography>Loading photos...</Typography>;
    if (isErrorPhotos) return <Typography>Error loading photos.</Typography>;
  } else {
    if (isLoadingPhoto || isLoadingAllPhotos) {
      return <Typography>Loading photo...</Typography>;
    }
    if (isErrorPhoto || isErrorAllPhotos) {
      return <Typography>Error loading photo.</Typography>;
    }
  }

  // If advanced enabled, render a single-photo viewer with stepper controls
  if (advancedEnabled) {
    if (!photo || !indexParam || totalPhotos === 0) {
      return <Typography>No photos found.</Typography>;
    }

    const currentIndex = indexParam;
    const handlePrev = () => {
      if (currentIndex > 1) navigate(`/photos/${userId}/${currentIndex - 1}`);
    };
    const handleNext = () => {
      if (currentIndex < totalPhotos) navigate(`/photos/${userId}/${currentIndex + 1}`);
    };

    return (
      <Box>
        <Card sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              aria-label="previous photo"
              onClick={handlePrev}
              disabled={currentIndex <= 1}
            >
              {'‹'}
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <CardMedia
                component="img"
                height="auto"
                image={`../../images/${photo.file_name}`}
                alt="User uploaded"
                sx={{ maxHeight: 400, objectFit: 'contain' }}
              />
            </Box>
            <IconButton
              aria-label="next photo"
              onClick={handleNext}
              disabled={currentIndex >= totalPhotos}
            >
              {'›'}
            </IconButton>
          </Box>
          <CardContent>
            <Typography variant="caption" color="textSecondary">
              Uploaded on: {new Date(photo.date_time).toLocaleString()}
            </Typography>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">Comments:</Typography>
            {photo.comments && photo.comments.length > 0 ? (
              photo.comments.map((comment) => (
                <Box key={comment._id} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(comment.date_time).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    By:{' '}
                    <MuiLink component={Link} to={`/users/${comment.user._id}`}>
                      {comment.user.first_name} {comment.user.last_name}
                    </MuiLink>
                  </Typography>
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {comment.comment}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ mt: 2 }}>
                No comments.
              </Typography>
            )}

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Typography variant="caption">{currentIndex} of {totalPhotos}</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Default (non-advanced) view: render all photos stacked
  if (!photos || photos.length === 0) {
    return <Typography>No photos found.</Typography>;
  }
  return (
    // Only render photos if they exist and the array isn't empty
    photos && photos.length > 0 && (
      <Box>
      {photos.map((photo_obj) => (
        <Card key={photo_obj._id} sx={{ mb: 4 }}>
          {/* Display the photo */}
          <CardMedia
            component="img"
            height="auto"
            image={`../../images/${photo_obj.file_name}`}
            alt="User uploaded"
            sx={{ maxHeight: 300, objectFit: 'contain' }}
          />
          <CardContent>
            {/* Photo upload timestamp */}
            <Typography variant="caption" color="textSecondary">
              Uploaded on: {new Date(photo_obj.date_time).toLocaleString()}
            </Typography>

            {/* Render comments if available */}
            {photo_obj.comments && photo_obj.comments.length > 0 ? (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1">Comments:</Typography>
                {photo_obj.comments.map((comment) => (
                  <Box key={comment._id} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(comment.date_time).toLocaleString()}
                    </Typography>
                    {/* Comment author (links to user profile) */}
                    <Typography variant="body2">
                      By:{' '}
                      <MuiLink
                        component={Link}
                        to={`/users/${comment.user._id}`}
                      >
                        {comment.user.first_name} {comment.user.last_name}
                      </MuiLink>
                    </Typography>
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      {comment.comment}
                    </Typography>
                  </Box>
                ))}
              </>
            ) : (
              // Fallback when there are no comments
              <Typography variant="body2" sx={{ mt: 2 }}>
                No comments.
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
      </Box>
    )
  );
}

UserPhotos.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserPhotos;
