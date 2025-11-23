import mongoose from "mongoose";
import User from "../schema/user.js";
import Photo from "../schema/photo.js";

// Returns the Photos for User (id).
export async function photosById(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Not found');
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
      return res.status(400).send('No photos found');
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

    return res.status(200).send(resultPhotos);
  } catch (err) {
    console.error('Error fetching photos by id:', err);
    return res.status(500).send({ error: 'Internal server error' });
  }
}

// returns the Photo for User (id) at a specific index. (1 indexed)
export async function photoByIdAndIndex(req, res) {
  const id = req.params.id;
  const index = parseInt(req.params.index, 10);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Not found');
  }

  try {
    const photos = await Photo.find({ user_id: id })
      .select('_id user_id comments file_name date_time')
      .populate({
        path: 'comments.user_id',
        select: '_id first_name last_name',
        model: User
      })
      .lean()
      .exec();

    if (photos.length < index || index < 1) {
      return res.status(400).send('Index out of bounds');
    }

    const photo = photos[index - 1];
    const resultPhoto = {
      ...photo,
      comments: photo.comments.map(c => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: c.user_id,
      })),
    };

    return res.status(200).send(resultPhoto);
  } catch (err) {
    console.error('Error fetching photos by id:', err);
    return res.status(500).send({ error: 'Internal server error' });
  }
}