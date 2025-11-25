import mongoose from "mongoose";
import Photo from "../schema/photo.js";
import User from "../schema/user.js";
import { getIo } from "../socket.js";

// Add a comment to a photo
export async function addComment(req, res) {
  const photoId = req.params.photo_id;

  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    return res.status(400).send({ error: 'Invalid photo ID' });
  }

  if (!req.session || !req.session.userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { comment, mentions = [] } = req.body;

  if (!comment || typeof comment !== 'string' || !comment.trim()) {
    return res.status(400).send({ error: 'Comment cannot be empty' });
  }

  try {
    // Find the photo
    const photo = await Photo.findById(photoId).exec();

    if (!photo) {
      return res.status(400).send({ error: 'Photo not found' });
    }

    const mentionObjectIds = mentions
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    // Create new comment object
    const createdComment = {
      comment: comment.trim(),
      date_time: new Date(),
      user_id: new mongoose.Types.ObjectId(req.session.userId),
      mentions: mentionObjectIds,
    };

    // add comment to photo's comments array
    photo.comments.push(createdComment);
    await photo.save();

    // fetch the updated photo with populated user info
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

    // Real-time: emit mention events to each mentioned user
    const io = getIo();
    if (io && mentionObjectIds.length > 0) {
      // Fetch owner (photo uploader)
      const owner = await User.findById(photo.user_id)
        .select('_id first_name last_name')
        .lean()
        .exec();
      
      // Compute index of this photo in owner's photo list (like userCommentsById)
      const userPhotos = await Photo.find({ user_id: photo.user_id })
        .select('_id')
        .lean()
        .exec();
      const indexInUserPhotos = userPhotos.findIndex(p => p._id.toString() === photo._id.toString()) + 1;

      // Payload shape should match fetchUserMentions()
      const mentionPayload = {
        _id: photo._id,
        file_name: photo.file_name,
        date_time: photo.date_time,
        owner: owner,
        index: indexInUserPhotos,
      };

      mentionObjectIds.forEach((mentionedUserId) => {
        io.to(`user:${mentionedUserId.toString()}`).emit('mention:new', mentionPayload);
      });
    }

    return res.status(200).send(resultPhoto);
  } catch (err) {
    console.error('Error adding comment:', err);
    return res.status(500).send({ error: 'Internal server error' });
  }
}

// Delete a comment from a photo
export async function deleteComment(req, res) {
  const { photo_id, comment_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(photo_id) ||
      !mongoose.Types.ObjectId.isValid(comment_id)) {
    return res.status(400).send({ error: "Invalid IDs" });
  }

  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const photo = await Photo.findOne(
      { _id: photo_id, "comments._id": comment_id },
      { "comments.$": 1 } // only matched comment
    ).lean().exec();

    if (!photo || !photo.comments || photo.comments.length === 0) {
      return res.status(400).send({ error: "Comment not found" });
    }

    const comment = photo.comments[0];

    // Only the comment author may delete
    if (String(comment.user_id) !== String(userId)) {
      return res.status(403).send({ error: "You do not own this comment" });
    }

    // Remove the comment from the photo
    await Photo.updateOne(
      { _id: photo_id },
      { $pull: { comments: { _id: comment_id } } }
    ).exec();

    return res.status(200).send({ message: "Comment deleted" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    return res.status(500).send({ error: "Internal server error" });
  }
}