import multer from "multer";
import fs from "fs/promises";
import path from "path";

// Define the temporary upload directory
const uploadDir = path.join(process.cwd(), "./temp");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Ensure the upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      console.log(`Multer saving to: ${uploadDir}`);
      cb(null, uploadDir);
    } catch (err) {
      console.error(`Multer destination error: ${err.message}`);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;
    const fileExtension = path.extname(file.originalname) || ".file";
    cb(null, `task-${uniqueSuffix}${fileExtension}`);
  },
});

export const upload = multer({ storage });
