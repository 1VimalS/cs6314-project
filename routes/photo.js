import express from "express";
import { photosById, photoByIdAndIndex, deletePhotoById } from "../controllers/photoController.js";

const router = express.Router();

router.get('/:id', photosById);
router.get('/:id/:index', photoByIdAndIndex);
router.delete('/:photo_id', deletePhotoById);

export default router;
