import { React, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Typography, Card, CardContent, Button, Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUser, fetchUserMentions } from '../../api';
import socket from '../../socketClient';

import './styles.css';

function UserDetail({ userId }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });

  const {
    data: mentions = [],
    isLoading: isLoadingMentions,
    isError: isErrorMentions,
  } = useQuery({
    queryKey: ['userMentions', userId],
    queryFn: () => fetchUserMentions(userId),
    enabled: !!userId,
  });

  const timeAgo = useCallback((date) => {
    if (!date) return '';
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;

    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }, []);

  // Set up socket listeners for real-time mention updates
  useEffect(() => {
    if (!userId) {
      return () => {};
    }

    // join this user's mention room
    socket.emit('watchUserMentions', { userId });

    const handleNewMention = () => {
      queryClient.invalidateQueries({ queryKey: ['userMentions', userId] });
    };

    socket.on('mention:new', handleNewMention);

    return () => {
      socket.emit('unwatchUserMentions', { userId });
      socket.off('mention:new', handleNewMention);
    };
  }, [userId, queryClient]);

  if (isLoading) { return <div>Loading user...</div>; }
  if (isError) { return <div>Error loading user.</div>; }

  return (
    // Only render once the user data has been successfully fetched 
    user && (
      <Box>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {user.first_name} {user.last_name}
            </Typography>
            {/* Occupation (displayed in a subtler color) */}
            <Typography variant="subtitle1" color="textSecondary">
              {user.occupation}
            </Typography>
            {/* User's location */}
            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>Location:</strong> {user.location}
            </Typography>
            {/* User description */}
            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>Description:</strong> {user.description}
            </Typography>
            {/* Button linking to the user's photo collection */}
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to={`/photos/${userId}`}
              >
                View {`${user.first_name}'s Photos`}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Photos where @{user.first_name} is mentioned
          </Typography>

          {isLoadingMentions && <Typography>Loading mentions...</Typography>}
          {isErrorMentions && <Typography>Error loading mentions.</Typography>}
          {!isLoadingMentions && !isErrorMentions && mentions.length === 0 && (
            <Typography variant="body2">
              No @mentions found for this user.
            </Typography>
          )}

          {!isLoadingMentions && !isErrorMentions && mentions.length > 0 && (
            <List>
              {mentions.map((photo) => (
                <div key={photo._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar
                        variant="square"
                        src={`../../images/${photo.file_name}`}
                        alt="thumbnail"
                        sx={{ width: 64, height: 64, mr: 2, cursor: 'pointer' }}
                        onClick={() => navigate(`/photos/${photo.owner._id}/${photo.index}`)}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={(
                        <Typography variant="body1">
                          Owner:{' '}
                          <Link to={`/users/${photo.owner._id}`}>
                            {photo.owner.first_name} {photo.owner.last_name}
                          </Link>
                        </Typography>
                      )}
                      secondary={(
                        <>
                          {photo.comment && (
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{ display: 'block' }}
                            >
                              “{photo.comment}”
                            </Typography>
                          )}
                          {photo.comment_date_time && (
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ display: 'block', mt: 0.5 }}
                            >
                              {timeAgo(photo.comment_date_time)}
                            </Typography>
                          )}
                        </>
                      )}
                    />
                  </ListItem>
                <Divider />
                </div>
              ))}
            </List>
          )}
        </Box>
      </Box>
    )
  );
}

UserDetail.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserDetail;
