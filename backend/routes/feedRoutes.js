import express from 'express';
import { getFeeds, createFeed, deleteFeed } from '../controllers/feedController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFeeds)
  .post(createFeed);

router.route('/:id')
  .delete(authorize('admin'), deleteFeed);

export default router;
