import multer from "multer";
import fs from 'fs'
import path from "path";
const uploadDir = "../tmp/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tempDir = path.join(process.cwd(), "temp/");
    try {
      await fs.mkdir(tempDir, { recursive: true });
      console.log(`Multer saving to: ${tempDir}`);
      cb(null, tempDir);
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

export const upload = multer({ storage: storage });

