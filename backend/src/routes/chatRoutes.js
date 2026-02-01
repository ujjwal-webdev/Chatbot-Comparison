import express from 'express';
import multer from 'multer';
import os from 'os';
import { handleChat } from '../controllers/chatController.js';

const router = express.Router();

const upload = multer({
    dest: process.env.UPLOAD_DIR || os.tmpdir(),
    limits: {
        fileSize: Number(process.env.UPLOAD_MAX_BYTES || 10 * 1024 * 1024) // 10MB
    },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        return cb(new Error('Invalid file type. Supported: JPEG, PNG, GIF, WebP'));
    }
});

router.post('/chat', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (!err) return next();

        // Multer-specific errors (like size limit)
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        }

        // File filter / other upload errors
        return res.status(400).json({ error: err instanceof Error ? err.message : 'Upload error' });
    });
}, handleChat);

export default router;
