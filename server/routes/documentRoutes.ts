import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth';
import { getDocuments, uploadDocument, deleteDocument } from '../controllers/documentController';

const router = Router();

// Ensure uploads folder exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const cleanOrigName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${uniqueSuffix}-${cleanOrigName}`);
  }
});

// Create Multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are allowed') as any, false);
    }
  }
});

// Protect all document routes
router.use(requireAuth as any);

// Routes
router.get('/', getDocuments);
router.post('/upload', upload.single('pdf'), uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
