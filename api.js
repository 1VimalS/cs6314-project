import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true, // Send cookies for session support
});

// Users
export const fetchUsers = async () => {
  try {
    const res = await api.get('/user/list');
    return res.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchUser = async (userId) => {
  try {
    const res = await api.get(`/user/${userId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const fetchUserCounts = async (userId) => {
  try {
    const res = await api.get(`/user/${userId}/counts`);
    return res.data;
  } catch (error) {
    console.error('Error fetching user counts:', error);
    throw error;
  }
};

export const fetchUserComments = async (userId) => {
  try {
    const res = await api.get(`/user/${userId}/comments`);
    return res.data;
  } catch (error) {
    console.error('Error fetching user comments:', error);
    throw error;
  }
};

// Photos
export const fetchPhotosOfUser = async (userId) => {
  try {
    const res = await api.get(`/photosOfUser/${userId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching photos of user:', error);
    throw error;
  }
};

export const fetchPhotoOfUserByIndex = async (userId, index) => {
  try {
    const res = await api.get(`/photosOfUser/${userId}/${index}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching photo of user by index:', error);
    throw error;
  }
};

// Comments
export const addComment = async (photoId, comment) => {
  try {
    const res = await api.post(`/commentsOfPhoto/${photoId}`, { comment });
    return res.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Authentication
export const login = async (login_name) => {
  try {
    const res = await api.post('/admin/login', { login_name });
    return res.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const res = await api.post('/admin/logout', {});
    return res.data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await api.get('/admin/currentUser');
    return res.data;
  } catch (error) {
    // 401 means not logged in, which is fine
    if (error.response && error.response.status === 401) {
      return null;
    }
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Photo upload
export const uploadPhoto = async (file) => {
  try {
    const formData = new FormData();
    if (file) {
      formData.append('photo', file);
    }

    const res = await api.post('/photos/new', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};
