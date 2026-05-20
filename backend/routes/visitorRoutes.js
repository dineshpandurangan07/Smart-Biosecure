import express from 'express';
import {
  getVisitors,
  createVisitor,
  checkoutVisitor,
  approveVisitor,
  deleteVisitor,
} from '../controllers/visitorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getVisitors)
  .post(createVisitor);

router.put('/:id/exit', checkoutVisitor);
router.put('/:id/approve', approveVisitor);
router.delete('/:id', authorize('admin'), deleteVisitor);

export default router;
