import express from "express";
import { login, logout, currentUser } from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/currentUser", currentUser);

export default router;
