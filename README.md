# Project 4: Photo App

**A lightweight photo-sharing app built with modern React tooling, a Node/Express backend, and MongoDB.**

## Prerequisites
- **Node.js:** LTS (>= 18)
- **npm:** (>= 9)
- **MongoDB:** running locally on `127.0.0.1`

## Technologies
- **React & Vite:** UI and fast development build tool.
- **Axios:** HTTP client for communicating with the backend.
- **TanStack Query:** Data fetching, caching, and update management.
- **Zustand:** Lightweight global state store for user/session state.
- **Express.js & Node.js:** Server and API implementation.
- **MongoDB:** Document database for users, photos, and comments.
- **Mongoose** ODM library for MongoDB, simplifying schema definitions and database interactions.
- **Socket.io:** Real-time updates for comments and mentions.

Each piece is used to provide a responsive client (React + Vite), robust data fetching and cache control (TanStack Query), simple global state (Zustand), and a session-backed API (Express + MongoDB) with real-time events (Socket.io).

## Install
Install project dependencies (all packages are listed in `package.json`):

```bash
npm install
```

## Load the database
1) Make sure MongoDB is running locally.
2) Load demo data:

```bash
node loadDatabase.js
```

This clears and reloads the demo `User`, `Photo`, and `SchemaInfo` documents into the database used by the server.

**Note:** Make sure your `webServer.js` connects to `mongodb://127.0.0.1/project3`.

## Run client + server together
Start both client and server together (recommended):

```bash
npm run dev
```

- Client (Vite): `http://localhost:3000`
- Server (Express): `http://localhost:3001`

Individual scripts:

```bash
npm run server   # nodemon webServer.js (port 3001)
npm run client   # vite (port 3000)
```

## Directory structure
- `photoShare.jsx` - main frontend entrypoint of the app
- `webServer.js` - main Express backend server
- `socket.js` / `socketClient.js` - server and client Socket.io handlers for real-time updates
- `components/` - React UI components (TopBar, UserList, UserPhotos, Favorites, etc.)
- `config/` - configuration and DB helpers (e.g., `db.js`)
- `controllers/` - request handlers and business logic for routes
- `middleware/` - Express middleware (authentication, upload handling)
- `routes/` - Express route definitions connecting endpoints to controllers
- `schema/` - Mongoose schema and model definitions
- `store/` - Zustand client-side global store for session and app state
- `images/` - directory for uploaded images (ensure it exists and is writable)

## API endpoints
- `POST /admin/login` → login user (body: `{ login_name, password }`)
- `POST /admin/logout` → logout user
- `GET /admin/currentUser` → get currently logged-in user (returns 401 when not logged in)
- `GET /user/list` → list users `[{ _id, first_name, last_name }]` (requires auth)
- `GET /user/:id` → user detail `{ _id, first_name, last_name, location, description, occupation }` (requires auth)
- `GET /user/:id/mentions` → photos that mention this user (requires auth)
- `GET /photosOfUser/:id` → photos for a user (with comments) (requires auth)
- `GET /photosOfUser/:id/:index` → single photo by index (requires auth)
- `POST /commentsOfPhoto/:photo_id` → add comment to photo (requires auth, body: `{ comment, mentions }`)
- `DELETE /commentsOfPhoto/:photo_id/:comment_id` → delete a comment (requires auth, must own the comment)
- `POST /photos/new` → upload photo (requires auth, multipart form data with `uploadedphoto`)
- `DELETE /photosOfUser/:photo_id` → delete a photo (requires auth, must own the photo)
- `POST /user` → register new user (body: `{ login_name, password, first_name, last_name, location, description, occupation }`)
- `GET /favorites` → list of current user's favorite photos (requires auth)
- `POST /favorites` → add a photo to favorites (body: `{ photo_id }`)
- `DELETE /favorites/:photoId` → remove a photo from favorites
- `GET /favorites/check/:photoId` → check whether current user has favorited a photo

## Features
This app implements the following key features and user stories:

- **@mentions in comments & Mentions Page:**
	- Users may `@mention` other users inside photo comments (e.g., `@alice`).
	- Mentioned users are discoverable: there is a way to see photos that mention a particular user (the app exposes endpoints for fetching mentions and the UI surfaces these).
	- Mentions are stored with comments so you can query and display photos that mention a specific user.

- **Real-Time Updates (Socket.io):**
	- New comments (including those that contain `@mentions`) are broadcast in real-time via Socket.io.
	- When someone comments with an `@mention`, affected users see the new comment appear immediately without refreshing.

- **Deleting comments, photos, and users:**
	- Users can delete comments and photos that they own.
	- A user may delete their account: account deletion cascades to remove that user's photos and comments from the system.

- **Favorites list per user:**
	- Logged-in users can favorite photos.
	- Each user has a dedicated Favorites page that displays their favorited photos.
	- Users can remove photos from their favorites directly on that page.

## Notes & troubleshooting
- Ensure the `images/` directory exists and is writable for photo uploads.
- MongoDB must be running locally for `loadDatabase.js` and the server to work.
- If you change ports or the DB connection, update `vite.config.js` or `webServer.js` accordingly.
