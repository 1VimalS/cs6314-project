import mongoose from "mongoose";
import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Photo from "../schema/photo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Compute PROJECT ROOT (go up from controllers/)
const ROOT_DIR = join(__dirname, "..");
const IMAGES_DIR = join(ROOT_DIR, 'images');


// Upload a photo for the current user
export default async function newPhotoUpload(req, res) {
  console.log('upload hit:', {
    userId: req.session && req.session.userId,
    file: req.file && req.file.originalname
  });

  // Check if user is logged in
    if (!req.session || !req.session.userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded' });
    }
  
    try {
      const { originalname, buffer } = req.file;
      // Ensure images directory exists
      await fs.promises.mkdir(IMAGES_DIR, { recursive: true });
      // Write buffer to disk in ./images with the same name the client sent
      const filePath = join(IMAGES_DIR, originalname);
      await fs.promises.writeFile(filePath, buffer);
  
      const newPhoto = await Photo.create({
        file_name: originalname, // must match what the test passes
        date_time: new Date(),
        user_id: new mongoose.Types.ObjectId(req.session.userId),
        comments: [],
      });
  
      return res.status(200).send({
        _id: newPhoto._id,
        file_name: newPhoto.file_name,
        date_time: newPhoto.date_time,
        user_id: newPhoto.user_id,
      });
    } catch (err) {
      console.error('Error uploading photo:', err);
      return res.status(500).send({ error: 'Internal server error' });
    }
}