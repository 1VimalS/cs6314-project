import React, { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import { Grid, Paper } from '@mui/material';
import {
  BrowserRouter, Route, Routes, useParams
} from 'react-router-dom';

import './styles/main.css';
// Import mock setup - Remove this once you have implemented the actual API calls
// import './lib/mockSetup.js';
import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import UserComments from './components/UserComments';

function UserDetailRoute() {
  const { userId } = useParams();
  // eslint-disable-next-line no-console
  console.log('UserDetailRoute: userId is:', userId);
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute({ advancedEnabled }) {
  const { userId } = useParams();
  return <UserPhotos userId={userId} advancedEnabled={advancedEnabled} />;
}

function UserCommentsRoute() {
  const { userId } = useParams();
  return <UserComments userId={userId} />;
}

function PhotoShare() {
  const path = window.location.pathname;
  const hasIndexParam = /^\/photos\/[^/]+\/\d+/.test(path);
  const [advancedEnabled, setAdvancedEnabled] = useState(hasIndexParam);

  return (
    <BrowserRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar advancedEnabled={advancedEnabled} setAdvancedEnabled={setAdvancedEnabled} />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserList advancedEnabled={advancedEnabled} />
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                <Route path="/users/:userId" element={<UserDetailRoute />} />
                <Route path="/photos/:userId" element={<UserPhotosRoute advancedEnabled={advancedEnabled} />} />
                <Route path="/photos/:userId/:index" element={<UserPhotosRoute advancedEnabled={advancedEnabled} />} />
                <Route path="/comments/:userId" element={<UserCommentsRoute />} />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
root.render(<PhotoShare />);
