import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Users
export const fetchUsers = async () => {
  const res = await api.get('/user/list');
  return res.data;
};

export const fetchUser = async (userId) => {
  const res = await api.get(`/user/${userId}`);
  return res.data;
};

export const fetchUserCounts = async (userId) => {
  const res = await api.get(`/user/${userId}/counts`);
  return res.data;
};

export const fetchUserComments = async (userId) => {
  const res = await api.get(`/user/${userId}/comments`);
  return res.data;
};

// Photos
export const fetchPhotosOfUser = async (userId) => {
  const res = await api.get(`/photosOfUser/${userId}`);
  return res.data;
};

export const fetchPhotoOfUserByIndex = async (userId, index) => {
  const res = await api.get(`/photosOfUser/${userId}/${index}`);
  return res.data;
};
