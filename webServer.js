/**
 * Project 2 Express server connected to MongoDB 'project2'.
 * Start with: node webServer.js
 * Client uses axios to call these endpoints.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import mongoose from "mongoose";
// eslint-disable-next-line import/no-extraneous-dependencies
import bluebird from "bluebird";
import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import axios from "axios";

// ToDO - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// import models from "./modelData/photoApp.js";

// Load the Mongoose schema for User, Photo, and SchemaInfo
// ToDO - Your submission will use code below, so make sure to uncomment this line for tests and before submission!
import User from "./schema/user.js";
import Photo from "./schema/photo.js";
import SchemaInfo from "./schema/schemaInfo.js";

const portno = 3001; // Port number to use
const app = express();

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

mongoose.Promise = bluebird;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project2", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * /test/info - Returns the SchemaInfo object of the database in JSON format.
 *              This is good for testing connectivity with MongoDB.
 */

app.get('/test/info', async (request, response) => {
  // Read SchemaInfo from MongoDB and return a plain object
  try {
    const info = await SchemaInfo.findOne().lean().exec();

    if (!info) {
      return response.status(500).send({ error: 'SchemaInfo not found' });
    }

    return response.status(200).send(info);
  } catch (err) {
    console.error('Error fetching SchemaInfo:', err);
    return response.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get('/test/counts', async (request, response) => {
  // Query counts from MongoDB using Mongoose models and return plain numbers
  try {
    const [userCount, photoCount, schemaInfoCount] = await Promise.all([
      User.countDocuments({}).exec(),
      Photo.countDocuments({}).exec(),
      SchemaInfo.countDocuments({}).exec(),
    ]);

    return response.status(200).send({
      user: userCount,
      photo: photoCount,
      schemaInfo: schemaInfoCount,
    });
  } catch (err) {
    console.error('Error fetching counts:', err);
    return response.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get('/user/list', async (request, response) => {
  try {
    const users = await User.find({}).select('_id first_name last_name').lean().exec();
    return response.status(200).send(users);
  } catch (err) {
    console.error('Error fetching user list:', err);
    return response.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get('/user/:id', async (request, response) => {
  const id = request.params.id;
  // Validate ObjectId first
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send('Not found');
  }
  
  try {
    const user = await User.findById(id)
      .select('_id first_name last_name location description occupation')
      .lean()
      .exec();

    if (!user) {
      return response.status(400).send('Not found');
    }

    return response.status(200).send(user);
  } catch (err) {
    console.error('Error fetching user by id:', err);
    return response.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * URL /user/:id/counts - Returns the number of photos the user owns and the
 * number of comments authored by the user across all photos.
 */
app.get('/user/:id/counts', async (request, response) => {
  const id = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send('Not found');
  }

  try {

    // Count photos owned by the user
    const photoCount = await Photo.countDocuments({ user_id: id }).exec();

    // Count comments authored by the user across all photos using aggregation
    const commentCount = await Photo.aggregate([
      {
        $project: {
          comments: 1,
          // Calculate the count of comments by the specific user in each photo
          userCommentCount: {
            $size: {
              $filter: {
                input: '$comments',
                as: 'c',
                cond: { $eq: ['$$c.user_id', new mongoose.Types.ObjectId(id)] } // Match the user_id
              }
            }
          }
        }
      },
      {
        // Sum up the counts from all photos
        $group: {
          _id: null, // Group all results into a single document
          totalCommentCount: { $sum: '$userCommentCount' }
        }
      }
    ]).exec();

    const commentCountReturn = (commentCount && commentCount.length > 0) ? commentCount[0].totalCommentCount : 0;

    return response.status(200).send({ photos: photoCount, comments: commentCountReturn });
  } catch (err) {
    console.error('Error fetching user counts:', err);
    return response.status(500).send({ error: 'Internal server error' });
  }
});


/**
 * URL /user/:id/comments - Returns the list of photos that contain comments
 * authored by the given user. For each photo, only the comments by that user
 * are returned (so the client can display each comment with a thumbnail).
 */
app.get('/user/:id/comments', async (request, response) => {
  const id = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send('Not found');
  }

  try {
    // Find photos that have at least one comment by this user
    const photos = await Photo.find({ 'comments.user_id': new mongoose.Types.ObjectId(id) })
      .select('_id file_name date_time user_id comments')
      .lean()
      .exec();

    // For each photo fetch that uploader’s photo list to find the index.
    const resultPromises = photos.map(async (p) => {
    const userPhotos = await Photo.find({ user_id: p.user_id })
      .select('_id')
      .lean()
      .exec();
    

    const indexInUserPhotos = userPhotos.findIndex((up) => String(up._id) === String(p._id)) + 1;

    // Filter down to only this user's comments
    const userComments = Array.isArray(p.comments)
      ? p.comments
          .filter((c) => String(c.user_id) === String(id))
          .map((c) => ({
            _id: c._id,
            comment: c.comment,
            date_time: c.date_time,
            user_id: c.user_id,
          }))
      : [];
    
      return {
        _id: p._id,
        file_name: p.file_name,
        date_time: p.date_time,
        user_id: p.user_id,
        index: indexInUserPhotos, // 1-indexed
        comments: userComments,
      };
    });

    const result = await Promise.all(resultPromises);
    return response.status(200).send(result);
  } catch (err) {
    console.error('Error fetching comments-by-user photos:', err);
    return response.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get('/photosOfUser/:id', async (request, response) => {
  const id = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send('Not found');
  }

  try {
    const photos = await Photo.find({ user_id: id })
      .select('_id user_id comments file_name date_time')
      .populate({
        path: 'comments.user_id', // populate each comment's user
        select: '_id first_name last_name', // only return minimal user info
        model: User
      })
      .lean()
      .exec();
    
    if (!photos.length) {
      return response.status(400).send('No photos found');
    }

    const resultPhotos = photos.map(photo => ({
      ...photo,
      comments: photo.comments.map(c => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: c.user_id, // rename populated user_id to user
      })),
    }));

    return response.status(200).send(resultPhotos);
  } catch (err) {
    console.error('Error fetching photos by id:', err);
    return response.status(500).send({ error: 'Internal server error' });
  }
});

/**
 * URL /photosOfUser/:id/:index - Returns the Photos for User (id) at a specific index. (1 indexed)
 */
app.get('/photosOfUser/:id/:index', async (request, response) => {
  const id = request.params.id;
  const index = parseInt(request.params.index, 10);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send('Not found');
  }

  try {
    const photos = await axios.get(`http://localhost:3001/photosOfUser/${id}`);
    if (photos.data.length < index || index < 1) {
      return response.status(400).send('Index out of bounds');
    }
    return response.status(200).send(photos.data[index - 1]);
  } catch (err) {
    console.error('Error fetching photos by id:', err);
    return response.status(500).send({ error: 'Internal server error' });
  }
});

const server = app.listen(portno, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
