import multer from "multer";

// configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
});

export default upload.single('uploadedphoto');