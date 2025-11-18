import { React } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Typography, Card, CardContent, Button, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../../api';

import './styles.css';

function UserDetail({ userId }) {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
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
      </Box>
    )
  );
}

UserDetail.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserDetail;
