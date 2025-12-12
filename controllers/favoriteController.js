import mongoose from "mongoose";
import Favorite from "../schema/favorite.js";
import Photo from "../schema/photo.js";

// gets all favorite photos current user
export async function getFavorites(req, res) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  try {
    const favorites = await Favorite.find({ user_id: userId })
      .populate({
        path: 'photo_id',
        select: '_id user_id file_name date_time',
        model: Photo
      })
      .lean()
      .exec();

    const validFavorites = favorites.filter(fav => fav.photo_id !== null);

    const resultPhotos = validFavorites.map(fav => ({
      _id: fav.photo_id._id,
      user_id: fav.photo_id.user_id,
      file_name: fav.photo_id.file_name,
      date_time: fav.photo_id.date_time,
    }));

    return res.status(200).send(resultPhotos);
  } catch (err) {
    console.error('Error fetching favorites:', err);
    return res.status(500).send({ error: 'Internal server error' });
  }
}

// add to fav
export async function addFavorite(req, res) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const { photo_id } = req.body;

  if (!photo_id || !mongoose.Types.ObjectId.isValid(photo_id)) {
    return res.status(400).send({ error: "Invalid photo ID" });
  }

  try {
    const photo = await Photo.findById(photo_id).lean().exec();
    if (!photo) {
      return res.status(400).send({ error: "Photo not found" });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user_id: userId,
      photo_id: photo_id
    }).lean().exec();

    if (existingFavorite) {
      return res.status(400).send({ error: "Photo already favorited" });
    }

    // create favorite
    const favorite = new Favorite({
      user_id: userId,
      photo_id: photo_id
    });

    await favorite.save();

    return res.status(200).send({ message: "Photo added to favorites" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).send({ error: "Photo already favorited" });
    }
    console.error('Error adding favorite:', err);
    return res.status(500).send({ error: 'Internal server error' });
  }
}

// remove from fav
export async function removeFavorite(req, res) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const { photo_id } = req.params;

  if (!photo_id || !mongoose.Types.ObjectId.isValid(photo_id)) {
    return res.status(400).send({ error: "Invalid photo ID" });
  }

  try {
    const result = await Favorite.deleteOne({
      user_id: userId,
      photo_id: photo_id
    }).exec();

    if (result.deletedCount === 0) {
      return res.status(400).send({ error: "Favorite not found" });
    }

    return res.status(200).send({ message: "Photo removed from favorites" });
  } catch (err) {
    console.error('Error removing favorite:', err);
    return res.status(500).send({ error: 'Internal server error' });
  }
}

export async function checkFavorite(req, res) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const { photo_id } = req.params;

  if (!photo_id || !mongoose.Types.ObjectId.isValid(photo_id)) {
    return res.status(400).send({ error: "Invalid photo ID" });
  }

  try {
    const favorite = await Favorite.findOne({
      user_id: userId,
      photo_id: photo_id
    }).lean().exec();

    return res.status(200).send({ isFavorited: !!favorite });
  } catch (err) {
    console.error('Error checking favorite:', err);
    return res.status(500).send({ error: 'Internal server error' });
  }
}