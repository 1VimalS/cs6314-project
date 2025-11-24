import { React } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Typography, Card, CardContent, Button, Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchUser, fetchUserMentions } from '../../api';

import './styles.css';

function UserDetail({ userId }) {
  const navigate = useNavigate();
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
