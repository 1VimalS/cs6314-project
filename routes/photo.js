import express from "express";
import { photosById, photoByIdAndIndex } from "../controllers/photoController.js";

const router = express.Router();

router.get('/:id', photosById);
router.get('/:id/:index', photoByIdAndIndex);

export default router;
