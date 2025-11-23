import express from "express";
import { register, list, userById, userCountsbyId, userCommentsById } from "../controllers/userController.js";

const router = express.Router();

router.post("/", register);
router.get("/list", list);
router.get("/:id", userById);
router.get('/:id/counts', userCountsbyId);
router.get('/:id/comments', userCommentsById);

export default router;
