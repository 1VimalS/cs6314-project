import express from "express";
import { getInfo, counts } from "../controllers/testController.js";

const router = express.Router();

router.get("/info", getInfo);
router.get("/counts", counts);

export default router;
