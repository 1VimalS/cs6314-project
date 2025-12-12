import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  // id of user hwo favorited the photo
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  // id of favorited photo
  photo_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Photo' },
  // data and time it was favorited
  date_time: { type: Date, default: Date.now },
});

favoriteSchema.index({ user_id: 1, photo_id: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;