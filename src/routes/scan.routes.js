import { Router } from "express";
import multer from "multer";
import { scanUpload } from "../controllers/scan.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", protect, upload.single("image"), scanUpload);

export default router;