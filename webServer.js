import express from "express";
import session from "express-session";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import requireAuth from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  await connectDB();
} catch (err) {
  console.error("Failed to connect to database", err);
  process.exit(1);
}

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

const server = app.listen(portno, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
    port +
    " exporting the directory " +
    __dirname
  );
});
