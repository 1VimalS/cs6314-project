import mongoose from "mongoose";
import Photo from "../schema/photo.js";
import User from "../schema/user.js";

// Add a comment to a photo
export default async function newComment(req, res) {
  const photoId = req.params.photo_id;

  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    return res.status(400).send({ error: 'Invalid photo ID' });
  }

  if (!req.session || !req.session.userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { comment } = req.body;

  if (!comment || typeof comment !== 'string' || !comment.trim()) {
    return res.status(400).send({ error: 'Comment cannot be empty' });
  }

  try {
    // Find the photo
    const photo = await Photo.findById(photoId).exec();

    if (!photo) {
      return res.status(400).send({ error: 'Photo not found' });
    }

    // Create new comment object
    const createdComment = {
      comment: comment.trim(),
      date_time: new Date(),
      user_id: new mongoose.Types.ObjectId(req.session.userId),
    };

    // add comment to photo's comments array
    photo.comments.push(createdComment);
    await photo.save();

    // getetch the updated photo with populated user info
    const updatedPhoto = await Photo.findById(photoId)
      .select('_id user_id comments file_name date_time')
      .populate({
        path: 'comments.user_id',
        select: '_id first_name last_name',
        model: User
      })
      .lean()
      .exec();

    const resultPhoto = {
      ...updatedPhoto,
      comments: updatedPhoto.comments.map(c => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: c.user_id,
      })),
    };

    return res.status(200).send(resultPhoto);
  } catch (err) {
    console.error('Error adding comment:', err);
    return res.status(500).send({ error: 'Internal server error' });
  }
}