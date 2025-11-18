import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
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
