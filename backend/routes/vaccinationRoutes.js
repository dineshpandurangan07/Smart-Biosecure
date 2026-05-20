import express from 'express';
import {
  getVaccinations,
  createVaccination,
  updateVaccination,
  getVaccinationReminders,
  deleteVaccination,
} from '../controllers/vaccinationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/reminders').get(getVaccinationReminders);

router.route('/')
  .get(getVaccinations)
  .post(createVaccination);

router.route('/:id')
  .put(updateVaccination)
  .delete(authorize('admin'), deleteVaccination);

export default router;
