import { Server } from 'socket.io';

let ioInstance = null;

export const initIo = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: 'http://localhost:3000', // React dev origin
      credentials: true,
    },
  });
  return ioInstance;
};

export const getIo = () => ioInstance;
