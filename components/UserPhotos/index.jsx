import { React, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Typography, Card, CardContent, CardMedia, Box, Divider, Link as MuiLink, IconButton, Stack, Button, Alert } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MentionsInput, Mention } from 'react-mentions';
import { fetchPhotosOfUser, fetchPhotoOfUserByIndex, addComment, fetchUsers, deletePhoto, deleteComment } from '../../api';
import useAppStore from '../../store/useAppStore';

import './styles.css';

function UserPhotos({ userId }) {
  const navigate = useNavigate();
  const params = useParams();
  const indexParam = params.index ? parseInt(params.index, 10) : null;
  const queryClient = useQueryClient();

  const { advancedEnabled, currentUser } = useAppStore();
  // mentions states for non-advanced mode
  const [advancedMentions, setAdvancedMentions] = useState([]);
  const [commentValue, setCommentValue] = useState('');
  const [commentPlainText, setCommentPlainText] = useState('');
  

  // mentions states for advanced mode
  const [commentMentions, setCommentMentions] = useState({});
  const [commentValues, setCommentValues] = useState({});
  const [commentPlainTexts, setCommentPlainTexts] = useState('');

  const [commentError, setCommentError] = useState('');

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
    retry: false, // Don't retry on error
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
    retry: false,
  });
  const totalPhotos = allPhotos.length;

  // Mutation for adding comments
  const addCommentMutation = useMutation({
    mutationFn: ({ photoId, comment, mentions }) => addComment(photoId, comment, mentions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photosOfUser', userId] });
      queryClient.invalidateQueries({ queryKey: ['photoOfUserByIndex', userId, indexParam] });
      queryClient.invalidateQueries({ queryKey: ['userCounts'] });
      queryClient.invalidateQueries({ queryKey: ['userMentions'] });
      setCommentError('');
    },
    onError: (error) => {
      if (error.response && error.response.status === 400) {
        setCommentError(error.response.data?.error || 'Failed to add comment');
      } else {
        setCommentError('An error occurred while adding the comment');
      }
    },
  });

  // Mutation for deleting photos
  const deletePhotoMutation = useMutation({
    mutationFn: (photoId) => deletePhoto(photoId),
    onSuccess: () => {
      // Refetch photos and user counts
      queryClient.invalidateQueries({ queryKey: ['photosOfUser', userId] });
      queryClient.invalidateQueries({ queryKey: ['photoOfUserByIndex', userId, indexParam] });
      queryClient.invalidateQueries({ queryKey: ['userCounts'] });

      // Simple navigation after delete
      if (advancedEnabled) {
        // Go to previous index if possible, else base photos page
        if (indexParam && indexParam > 1) {
          navigate(`/photos/${userId}/${indexParam - 1}`);
        } else {
          navigate(`/photos/${userId}`);
        }
      }
    },
    onError: (error) => {
      console.error('Error deleting photo:', error);
      setCommentError('Failed to delete photo');
    },
  });

  // Mutation for deleting comments
  const deleteCommentMutation = useMutation({
    mutationFn: ({ photoId, commentId }) => deleteComment(photoId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photosOfUser', userId] });
      queryClient.invalidateQueries({ queryKey: ['photoOfUserByIndex', userId, indexParam] });
      queryClient.invalidateQueries({ queryKey: ['userCounts'] });
      setCommentError('');
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      setCommentError('Failed to delete comment');
    },
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: !!currentUser
  });

  const mentionUsers = allUsers.map((u) => ({
    id: u._id,
    display: `${u.first_name} ${u.last_name}`,
  }));

  const handleAddComment = ({ photoId, text, mentions }) => {
    const commentToAdd = text || '';
    if (!commentToAdd) {
      setCommentError('Comment cannot be empty');
      return;
    }
    const mentionsArray = mentions
    ?? (photoId ? commentMentions[photoId] : advancedMentions)
    ?? [];

    const mentionIds = mentionsArray.map((m) => m.id);

    setCommentError('');
    addCommentMutation.mutate(
      { photoId, comment: commentToAdd, mentions: mentionIds },
      {
        onSuccess: () => {
          // Clear comment input after successful addition
          if (advancedEnabled) {
            setCommentValue('');
            setCommentPlainText('');
            setAdvancedMentions([]);
          } else {
            setCommentValues((prev) => ({ ...prev, [photoId]: '' }));
            setCommentPlainTexts((prev) => ({ ...prev, [photoId]: '' }));
            setCommentMentions((prev) => ({ ...prev, [photoId]: [] }));
          }
        },
      }
    );
  };

  const handleDeletePhoto = (photoId) => {
    deletePhotoMutation.mutate(photoId);
  };

  const handleDeleteComment = (photoId, commentId) => {
    deleteCommentMutation.mutate({ photoId, commentId });
  };

  // Loading / error states
  if (!advancedEnabled) {
    if (isLoadingPhotos) return <Typography>Loading photos...</Typography>;
    if (isErrorPhotos || photos.length === 0) {
      return <Typography>No photos found.</Typography>;
    }
  } else {
    if (isLoadingPhoto || isLoadingAllPhotos) {
      return <Typography>Loading photo...</Typography>;
    }
    if (isErrorPhoto || isErrorAllPhotos || totalPhotos === 0) {
      return <Typography>No photos found.</Typography>;
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

            {/* Delete photo button if current user is the owner */}
            {currentUser && String(photo.user_id) === String(currentUser._id) && (
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleDeletePhoto(photo._id)}
                  disabled={deletePhotoMutation.isPending}
                >
                  {deletePhotoMutation.isPending ? 'Deleting...' : 'Delete Photo'}
                </Button>
              </Box>
            )}

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

                  {/* Delete comment button for the author */}
                  {currentUser && comment.user._id === currentUser._id && (
                    <Button
                      size="small"
                      color="error"
                      sx={{ mt: 0.5, ml: 1 }}
                      onClick={() => handleDeleteComment(photo._id, comment._id)}
                    >
                      Delete Comment
                    </Button>
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ mt: 2 }}>
                No comments.
              </Typography>
            )}

            {currentUser && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Add a comment:
                </Typography>
                {commentError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {commentError}
                  </Alert>
                )}

                <MentionsInput
                  className="mentions-input mui-mentions"
                  value={commentValue}
                  onChange={(event, newValue, newPlainTextValue, mentions) => {
                    setCommentValue(newValue);
                    setCommentPlainText(newPlainTextValue);
                    setAdvancedMentions(mentions || []);
                    setCommentError('');
                  }}
                  placeholder="Write your comment here... Use @ to mention users."
                  disabled={addCommentMutation.isPending}
                >
                  <Mention
                    trigger="@"
                    data={mentionUsers}
                    displayTransform={(id, display) => `@${display}`}
                    renderSuggestion={(entry, search, highlightedDisplay, index, focused) => (
                      <div className={`mui-mention-item ${focused ? "focused" : ""}`}>
                        <div className="mui-mention-text">{highlightedDisplay}</div>
                      </div>
                    )}
                  />
                </MentionsInput>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddComment({
                    photoId: photo._id,
                    text: commentPlainText,
                    mentions: advancedMentions,
                  })}
                  disabled={addCommentMutation.isPending}
                >
                  {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
                </Button>
              </Box>
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

              {/* Delete photo button if current user is the owner */}
              {currentUser && String(photo_obj.user_id) === String(currentUser._id) && (
                <Box sx={{ mt: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeletePhoto(photo_obj._id)}
                    disabled={deletePhotoMutation.isPending}
                  >
                    {deletePhotoMutation.isPending ? 'Deleting...' : 'Delete Photo'}
                  </Button>
                </Box>
              )}

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
                      
                      {/* Delete comment button for the author */}
                      {currentUser && comment.user._id === currentUser._id && (
                        <Button
                          size="small"
                          color="error"
                          sx={{ mt: 0.5, ml: 1 }}
                          onClick={() => handleDeleteComment(photo_obj._id, comment._id)}
                        >
                          Delete Comment
                        </Button>
                      )}
                    </Box>
                  ))}
                </>
              ) : (
                // Fallback when there are no comments
                <Typography variant="body2" sx={{ mt: 2 }}>
                  No comments.
                </Typography>
              )}

              {currentUser && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Add a comment:
                  </Typography>
                  {commentError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {commentError}
                    </Alert>
                  )}

                  <MentionsInput
                    className="mentions-input mui-mentions"
                    value={commentValues[photo_obj._id] || ''}
                    onChange={(event, newValue, newPlainTextValue, mentions) => {
                      setCommentValues((prev) => ({
                        ...prev,
                        [photo_obj._id]: newValue,
                      }));
                      setCommentPlainTexts((prev) => ({
                        ...prev,
                        [photo_obj._id]: newPlainTextValue,
                      }));
                      setCommentMentions((prev) => ({
                        ...prev,
                        [photo_obj._id]: mentions || [],
                      }));
                      setCommentError('');
                    }}
                    placeholder="Write your comment here... Use @ to mention users."
                  >
                    <Mention
                      trigger="@"
                      data={mentionUsers}
                      displayTransform={(id, display) => `@${display}`}
                      renderSuggestion={(entry, search, highlightedDisplay, index, focused) => (
                      <div className={`mui-mention-item ${focused ? "focused" : ""}`}>
                        <div className="mui-mention-text">{highlightedDisplay}</div>
                      </div>
                    )}
                    />
                  </MentionsInput>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAddComment({
                      photoId: photo_obj._id,
                      text: commentPlainTexts[photo_obj._id],
                      mentions: commentMentions[photo_obj._id] || [],
                    })}
                    disabled={addCommentMutation.isPending}
                  >
                    {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
                  </Button>
                </Box>
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
