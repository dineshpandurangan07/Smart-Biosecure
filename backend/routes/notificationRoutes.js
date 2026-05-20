import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  readAllNotifications,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications);

router.put('/read-all', readAllNotifications);
router.put('/:id/read', markNotificationAsRead);
router.delete('/:id', authorize('admin'), deleteNotification);

export default router;
