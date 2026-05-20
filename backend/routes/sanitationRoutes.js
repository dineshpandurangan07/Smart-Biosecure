import express from 'express';
import { getSanitations, createSanitation, deleteSanitation } from '../controllers/sanitationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSanitations)
  .post(createSanitation);

router.route('/:id')
  .delete(authorize('admin'), deleteSanitation);

export default router;
