import { useEffect, useState, React } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

import './styles.css';

function UserList({ advancedEnabled = false }) {
  // State to store the list of all users
  const [users, setUsers] = useState([]);
  // State to store counts per user: { [userId]: { photos: number, comments: number } }
  const [counts, setCounts] = useState({});
  // Hook used for programmatic navigation
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the list of users when the component first mounts
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:3001/user/list');
        setUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  // When advancedEnabled is on and we have users, fetch the counts for each user
  useEffect(() => {
    if (!advancedEnabled || !users || users.length === 0) return () => {};

    let cancelled = false;

    const fetchCounts = async () => {
      try {
        const promises = users.map((u) => axios.get(`http://localhost:3001/user/${u._id}/counts`).then(r => ({ id: u._id, data: r.data })).catch(err => {
          console.error(`Failed to fetch counts for user ${u._id}:`, err);
          return { id: u._id, data: { photos: 0, comments: 0 } };
        }));

        const results = await Promise.all(promises);
        if (cancelled) return;

        const map = {};
        results.forEach(r => { map[r.id] = r.data; });
        setCounts(map);
      } catch (err) {
        console.error('Error fetching user counts:', err);
      }
    };

    fetchCounts();

    return () => { cancelled = true; };
  }, [advancedEnabled, users]);

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
