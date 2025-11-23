import express from "express";
import newComment from "../controllers/commentController.js";

const router = express.Router();

router.post('/:photo_id', newComment);

export default router;
