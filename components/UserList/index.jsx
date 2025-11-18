import { React } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers, fetchUserCounts } from '../../api';
import './styles.css';

function UserList({ advancedEnabled = false }) {
  // Hook used for programmatic navigation
  const navigate = useNavigate();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: counts = {} } = useQuery({
    queryKey: ['userCounts', users.map(u => u._id)],
    queryFn: async () => {
      const results = await Promise.all(
        users.map(u => fetchUserCounts(u._id)
            .then(data => ({ id: u._id, data }))
            .catch(() => ({ id: u._id, data: { photos: 0, comments: 0 } }))
        )
      );
      const map = {};
      results.forEach(r => { map[r.id] = r.data; });
      return map;
    },
    enabled: advancedEnabled && users.length > 0,
  });

  return (
    <div>
      <List component="nav">
        {/* Only render users if the array is not empty */}
        {users && users.length > 0 &&
          users.map(user => (
            <div key={user._id} className="user-list-row">
              {/* Clicking a user navigates to their detail page */}
              <ListItem onClick={() => navigate(`/users/${user._id}`)}>
                <ListItemText key={user._id} primary={user.first_name + " " + user.last_name} />
                {advancedEnabled && (
                  <div className="bubbles-container">
                    <button
                      type="button"
                      className="count-bubble photo-bubble"
                      onClick={(e) => { e.stopPropagation(); }}
                      aria-label={`Photos for ${user.first_name} ${user.last_name}`}
                    >
                      {(counts[user._id] && counts[user._id].photos) || 0}
                    </button>
                    <button
                      type="button"
                      className="count-bubble comment-bubble"
                      onClick={(e) => { e.stopPropagation(); navigate(`/comments/${user._id}`); }}
                      aria-label={`Comments for ${user.first_name} ${user.last_name}`}
                    >
                      {(counts[user._id] && counts[user._id].comments) || 0}
                    </button>
                  </div>
                )}
              </ListItem>
              <Divider />
            </div>
        ))}
      </List>
    </div>
  );
}

export default UserList;
