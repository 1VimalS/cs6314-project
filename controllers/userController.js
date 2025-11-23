import mongoose from "mongoose";
import User from "../schema/user.js";
import Photo from "../schema/photo.js";

export async function register(req, res) {
    try {
    const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

    if (!login_name || typeof login_name !== 'string' || !login_name.trim()) {
      return res.status(400).send('login_name is required and must be a non-empty string');
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return res.status(400).send('password is required and must be a non-empty string');
    }

    if (!first_name || typeof first_name !== 'string' || !first_name.trim()) {
      return res.status(400).send('first_name is required and must be a non-empty string');
    }

    if (!last_name || typeof last_name !== 'string' || !last_name.trim()) {
      return res.status(400).send('last_name is required and must be a non-empty string');
    }

    const existingUser = await User.findOne({ login_name }).lean().exec();
    if (existingUser) {
      return res.status(400).send('login_name already exists');
    }

    const newUser = await User.create({
      login_name: login_name.trim(),
      password: password.trim(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      location: location ? location.trim() : '',
      description: description ? description.trim() : '',
      occupation: occupation ? occupation.trim() : '',
    });

    return res.status(200).send({
      _id: newUser._id,
      login_name: newUser.login_name,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      location: newUser.location,
      description: newUser.description,
      occupation: newUser.occupation,
    });
  } catch (err) {
    console.error('Error registering user:', err);
    return res.status(500).send('Internal server error');
  }
}

export async function list(req, res) {
  try {
    const users = await User.find({}).select('_id first_name last_name').lean().exec();
    return res.status(200).send(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).send('Internal server error');
  }
}

export async function userById(req, res) {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid user ID');
    }

    try {
        const user = await User.findById(id)
        .select('_id first_name last_name location description occupation')
        .lean()
        .exec();

        if (!user) {
            return res.status(400).send('Not found');
        }
        return res.status(200).send(user);
    } catch (err) {
        console.error('Error fetching user by id:', err);
        return res.status(500).send({ error: 'Internal server error' });
    }
}

/**
 * Returns the number of photos the user owns and the
 * number of comments authored by the user across all photos.
 */
export async function userCountsbyId(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Not found');
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

    return res.status(200).send({ photos: photoCount, comments: commentCountReturn });
  } catch (err) {
    console.error('Error fetching user counts:', err);
    return res.status(500).send({ error: 'Internal server error' });
  }
}

export async function userCommentsById(req, res) {
    const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Not found');
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
    return res.status(200).send(result);
  } catch (err) {
    console.error('Error fetching comments-by-user photos:', err);
    return res.status(500).send({ error: 'Internal server error' });
  }
}