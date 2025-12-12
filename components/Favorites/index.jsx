import { React, useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Modal,
  Backdrop,
  Fade,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFavorites, removeFavorite } from '../../api';
import './styles.css';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxWidth: '90vw',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

function Favorites() {
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: favorites = [], isLoading, isError } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (photoId) => removeFavorite(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      // Also invalidate favorite status for photos
      queryClient.invalidateQueries({ queryKey: ['favoriteStatus'] });
    },
    onError: (error) => {
      console.error('Error removing favorite:', error);
    },
  });

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPhoto(null);
  };

  const handleRemoveFavorite = (e, photoId) => {
    e.stopPropagation();
    removeFavoriteMutation.mutate(photoId);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography variant="h6" color="error">
        Error loading favorites. Please try again.
      </Typography>
    );
  }

  if (favorites.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          My Favorites
        </Typography>
        <Typography variant="body1" color="textSecondary">
          You haven&apos;t favorited any photos yet. Start favoriting photos to see them here!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        My Favorites
      </Typography>
      <Grid container spacing={2}>
        {favorites.map((photo) => (
          <Grid item xs={6} sm={4} md={3} key={photo._id}>
            <Card
              sx={{
                position: 'relative',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => handlePhotoClick(photo)}
            >
              <CardMedia
                component="img"
                image={`../../images/${photo.file_name}`}
                alt="Favorite photo"
                sx={{
                  height: 200,
                  objectFit: 'cover',
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
                onClick={(e) => handleRemoveFavorite(e, photo._id)}
                disabled={removeFavoriteMutation.isPending}
                aria-label="Remove from favorites"
              >
                <CloseIcon />
              </IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal for viewing photo */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <Box sx={style}>
            {selectedPhoto && (
              <>
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                  onClick={handleCloseModal}
                  aria-label="Close"
                >
                  <CloseIcon />
                </IconButton>
                <Box
                  component="img"
                  src={`../../images/${selectedPhoto.file_name}`}
                  alt="Favorite photo"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    mb: 2,
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  Uploaded on: {new Date(selectedPhoto.date_time).toLocaleString()}
                </Typography>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}

export default Favorites;