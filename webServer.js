import express from "express";
import session from "express-session";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import requireAuth from "./middleware/auth.js";
import { initIo } from "./socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to MongoDB
try {
  await connectDB();
} catch (err) {
  console.error("Failed to connect to database", err);
  process.exit(1);
}

// Set up Express app
const portno = 3001;
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Session middleware
app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Authentication middleware
app.use(requireAuth);

// Load all main routes
app.use('/', routes);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = initIo(server);

// Configure socket rooms for watching user mentions
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('watchUserMentions', ({ userId }) => {
    if (!userId) return;
    socket.join(`user:${userId}`);
    console.log(`Socket ${socket.id} joined room user:${userId}`);
  });

  socket.on('unwatchUserMentions', ({ userId }) => {
    if (!userId) return;
    socket.leave(`user:${userId}`);
    console.log(`Socket ${socket.id} left room user:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Start the server
server.listen(portno, () => {
  console.log(
    "Listening at http://localhost:" +
      portno +
      " exporting the directory " +
      __dirname
  );
});
