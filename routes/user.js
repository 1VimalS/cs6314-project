import express from "express";
import { register, list, userById, userCountsbyId, userCommentsById, userMentionsById } from "../controllers/userController.js";

const router = express.Router();

router.post("/", register);
router.get("/list", list);
router.get("/:id", userById);
router.get('/:id/counts', userCountsbyId);
router.get('/:id/comments', userCommentsById);
router.get('/:id/mentions', userMentionsById);

export default router;
