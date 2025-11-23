import express from "express";
import adminRoutes from "./admin.js";
import userRoutes from "./user.js";
import photoRoutes from "./photo.js";
import testRoutes from "./test.js";
import newPhotoRoute from "./newPhoto.js";
import commentRoute from "./comment.js";

// Main router which links to further sub-routers
const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/user", userRoutes);
router.use("/photosOfUser", photoRoutes);
router.use("/test", testRoutes);

router.use("/photos", newPhotoRoute);
router.use("/commentsOfPhoto", commentRoute);

router.get("/", (req, res) => {
  res.send("Simple web server of files from " + __dirname);
});

export default router;