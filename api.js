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

export const fetchUserMentions = async (userId) => {
  try {
    const res = await api.get(`/user/${userId}/mentions`);
    return res.data;
  } catch (error) {
    console.error('Error fetching user mentions:', error);
    throw error;
  }
};

export const deleteUserAccount = async (userId) => {
  try {
    const res = await api.delete(`/user/${userId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};

// Photos
export const fetchPhotosOfUser = async (userId) => {
  try {
    const res = await api.get(`/photosOfUser/${userId}`);
    return res.data;
  } catch (error) {
    // if 400 error with "No photos found", return empty array instead of throwing
    if (error.response && error.response.status === 400 &&
      (error.response.data === 'No photos found' || error.response.data?.includes('No photos found'))) {
      return [];
    }
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

export const deletePhoto = async (photoId) => {
  try {
    const res = await api.delete(`/photosOfUser/${photoId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

// Comments
export const addComment = async (photoId, comment, mentions = []) => {
  try {
    const res = await api.post(`/commentsOfPhoto/${photoId}`, { comment, mentions });
    return res.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const deleteComment = async (photoId, commentId) => {
  try {
    const res = await api.delete(`/commentsOfPhoto/${photoId}/${commentId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Auth
export const login = async (login_name, password) => {
  try {
    const res = await api.post('/admin/login', { login_name, password });
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

export const register = async (userData) => {
  try {
    const res = await api.post('/user', userData);
    return res.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Photo upload
export const uploadPhoto = async (file) => {
  try {
    const formData = new FormData();
    if (file) {
      formData.append('uploadedphoto', file);
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

// Favorites
export const fetchFavorites = async () => {
  try {
    const res = await api.get('/favorites');
    return res.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

export const addFavorite = async (photoId) => {
  try {
    const res = await api.post('/favorites', { photo_id: photoId });
    return res.data;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

export const removeFavorite = async (photoId) => {
  try {
    const res = await api.delete(`/favorites/${photoId}`);
    return res.data;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

export const checkFavorite = async (photoId) => {
  try {
    const res = await api.get(`/favorites/check/${photoId}`);
    return res.data.isFavorited;
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};