import express from 'express';
import {
  getDiseases,
  createDiseaseReport,
  updateDiseaseStatus,
  getAIPrediction,
  deleteDisease,
} from '../controllers/diseaseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/ai-predict', getAIPrediction);

router.route('/')
  .get(getDiseases)
  .post(createDiseaseReport);

router.route('/:id')
  .delete(authorize('admin'), deleteDisease);

router.route('/:id/status')
  .put(updateDiseaseStatus);

export default router;
