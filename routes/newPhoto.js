import express from "express";
import upload from "../middleware/upload.js";
import newPhotoUpload from "../controllers/newPhotoController.js";

const router = express.Router();

router.post('/new', upload, newPhotoUpload);

export default router;
