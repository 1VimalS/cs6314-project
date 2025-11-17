import { useEffect, useState, React } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Typography, Card, CardContent, CardMedia, Box, Divider, Link as MuiLink, IconButton, Stack } from '@mui/material';
import axios from 'axios';

import './styles.css';

function UserPhotos({ userId, advancedEnabled }) {
  const navigate = useNavigate();
  const params = useParams();
  const indexParam = params.index ? parseInt(params.index, 10) : null;
  // State to store the list of photos for the user
  const [photos, setPhotos] = useState([]); // non-advanced mode
  const [photo, setPhoto] = useState(null); // advanced mode
  const [totalPhotos, setTotalPhotos] = useState(0);

  // Handle route switching when advanced feature toggle changes
  useEffect(() => {
    if (advancedEnabled && !indexParam) {
      // If advanced turned on but URL has no index, append /1
      navigate(`/photos/${userId}/1`, { replace: true });
    } else if (!advancedEnabled && indexParam) {
      // If advanced turned off but URL has /:index, go back to base user photos
      navigate(`/photos/${userId}`, { replace: true });
    }
  }, [advancedEnabled]);

  // Non-advanced mode: fetch all photos when userId or advancedEnabled changes
  useEffect(() => {
    if (!advancedEnabled) {
      const fetchAllPhotos = async () => {
        try {
          const res = await axios.get(`http://localhost:3001/photosOfUser/${userId}`);
          setPhotos(res.data);
        } catch (error) {
          console.error('Error fetching all user photos:', error);
        }
      };
      fetchAllPhotos();
    }
  }, [userId, advancedEnabled]);

  // Advanced mode: fetch single photo by index
  useEffect(() => {
    if (advancedEnabled && indexParam) {
      const fetchPhotoByIndex = async () => {
        try {
          const res = await axios.get(`http://localhost:3001/photosOfUser/${userId}/${indexParam}`);
          setPhoto(res.data);
          // Also fetch total count once so we know bounds
          const all = await axios.get(`http://localhost:3001/photosOfUser/${userId}`);
          setTotalPhotos(all.data.length);
        } catch (error) {
          console.error('Error fetching photo by index:', error);
          setPhoto(null);
        }
      };
      fetchPhotoByIndex();
    }
  }, [userId, indexParam, advancedEnabled]);

  // If advanced enabled, render a single-photo viewer with stepper controls
  if (advancedEnabled) {
    if (!photo) return null;

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

  // Default (non-advanced) view: render all photos as before
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
  advancedEnabled: PropTypes.bool.isRequired,
};

export default UserPhotos;
