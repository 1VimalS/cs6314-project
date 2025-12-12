import express from "express";
import { getFavorites, addFavorite, removeFavorite, checkFavorite } from "../controllers/favoriteController.js";

const router = express.Router();

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:photo_id', removeFavorite);
router.get('/check/:photo_id', checkFavorite);

export default router;