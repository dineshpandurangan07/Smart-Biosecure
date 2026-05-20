import express from 'express';
import { getDashboardStats, getIoTStream } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/iot-stream', getIoTStream);

export default router;
