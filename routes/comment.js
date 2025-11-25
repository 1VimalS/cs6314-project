import express from "express";
import { addComment, deleteComment } from "../controllers/commentController.js";

const router = express.Router();

router.post('/:photo_id', addComment);
router.delete('/:photo_id/:comment_id', deleteComment);

export default router;
