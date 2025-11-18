import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Divider, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchUserComments } from '../../api';

import './styles.css';

function UserComments({ userId: propUserId }) {
  const params = useParams();
  const userId = propUserId || params.userId;
  const navigate = useNavigate();

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['userComments', userId],
    queryFn: () => fetchUserComments(userId),
    enabled: !!userId,
  });

  const goToPhoto = (photo) => {
    const ownerId = (photo.user_id && photo.user_id._id) || photo.user_id || '';
    navigate(`/photos/${ownerId}/${photo.index}`);
  };

  if (isLoading) return <Typography>Loading comments...</Typography>;
  if (isError) return <Typography>Error loading comments.</Typography>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Comments</Typography>
      <List>
        {items.length === 0 && (
          <Typography variant="body2">No comments found.</Typography>
        )}
        {items.map((photo) => (
          <div key={photo._id}>
            {photo.comments.map((c) => (
              <ListItem
                key={c._id}
                alignItems="flex-start"
                button={false}
                onClick={() => goToPhoto(photo)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemAvatar>
                  <Avatar
                    variant="square"
                    src={`../../images/${photo.file_name}`}
                    alt="thumbnail"
                    sx={{ width: 64, height: 64, mr: 2 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={c.comment}
                  secondary={new Date(c.date_time).toLocaleString()}
                />
              </ListItem>
            ))}
            <Divider />
          </div>
        ))}
      </List>
    </Box>
  );
}

UserComments.propTypes = {
  userId: PropTypes.string,
};

UserComments.defaultProps = {
  userId: undefined,
};

export default UserComments;
