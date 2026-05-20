import express from 'express';
import {
  getAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from '../controllers/animalController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAnimals)
  .post(createAnimal);

router.route('/:id')
  .get(getAnimalById)
  .put(updateAnimal)
  .delete(authorize('admin'), deleteAnimal);

export default router;
