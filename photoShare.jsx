import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Grid, Paper } from '@mui/material';
import {
  BrowserRouter, Route, Routes, useParams, Navigate, useLocation
} from 'react-router-dom';

import './styles/main.css';
import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import UserComments from './components/UserComments';
import LoginRegister from './components/LoginRegister';
import useAppStore from './store/useAppStore';
import { getCurrentUser } from './api';


function UserDetailRoute() {
  const { userId } = useParams();
  return (
    <ProtectedRoute>
      <UserDetail userId={userId} />
    </ProtectedRoute>
  );
}

function UserPhotosRoute() {
  const { userId } = useParams();
  return (
    <ProtectedRoute>
      <UserPhotos userId={userId} />
    </ProtectedRoute>
  );
}

function UserCommentsRoute() {
  const { userId } = useParams();
  return (
    <ProtectedRoute>
      <UserComments userId={userId} />
    </ProtectedRoute>
  );
}

// redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const { currentUser } = useAppStore();
  const location = useLocation();

  if (!currentUser) {
    // redirect to login, but save the attempted location
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

function PhotoShare() {
  // check if URL has /photos/:userId/:index pattern
  const path = window.location.pathname;
  const hasIndexParam = /^\/photos\/[^/]+\/\d+/.test(path);
  // get state and actions from store
  const { advancedEnabled, setAdvancedEnabled, currentUser, setCurrentUser } = useAppStore();

  useEffect(() => {
    // when load,  set advancedEnabled based on URL
    if (hasIndexParam && !advancedEnabled) {
      setAdvancedEnabled(true);
    }

    // Check if user is already logged in (restore session)
    const checkLoginStatus = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (err) {
        // User is not logged in, which is fine
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <BrowserRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar />
          </Grid>
          <div className="main-topbar-buffer" />
          {currentUser ? (
            <>
              <Grid item sm={3}>
                <Paper className="main-grid-item">
                  <UserList advancedEnabled={advancedEnabled} />
                </Paper>
              </Grid>
              <Grid item sm={9}>
                <Paper className="main-grid-item">
                  <Routes>
                    <Route path="/users/:userId" element={<UserDetailRoute />} />
                    <Route path="/photos/:userId" element={<UserPhotosRoute />} />
                    <Route path="/photos/:userId/:index" element={<UserPhotosRoute />} />
                    <Route path="/comments/:userId" element={<UserCommentsRoute />} />
                    {/* Default route to current user's detail */}
                    <Route path="/" element={<Navigate to={`/users/${currentUser._id}`} replace />} />
                  </Routes>
                </Paper>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Paper className="main-grid-item">
                <Routes>
                  <Route path="/" element={<LoginRegister />} />
                  <Route path="*" element={<LoginRegister />} />
                </Routes>
              </Paper>
            </Grid>
          )}
        </Grid>
      </div>
    </BrowserRouter>
  );
}

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
root.render(
  <QueryClientProvider client={queryClient}>
    <PhotoShare />
  </QueryClientProvider>
);
