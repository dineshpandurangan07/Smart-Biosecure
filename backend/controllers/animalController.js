import Animal from '../models/Animal.js';

// @desc    Get all animals with search and filter
// @route   GET /api/animals
// @access  Private
export const getAnimals = async (req, res) => {
  const { species, houseNumber, healthStatus, search } = req.query;
  let query = {};

  // Filters
  if (species) query.species = species;
  if (houseNumber) query.houseNumber = houseNumber;
  if (healthStatus) query.healthStatus = healthStatus;

  // Search filter
  if (search) {
    query.$or = [
      { tagId: { $regex: search, $options: 'i' } },
      { breed: { $regex: search, $options: 'i' } },
      { statusNotes: { $regex: search, $options: 'i' } },
    ];
  }

  try {
    const animals = await Animal.find(query).sort({ createdAt: -1 });
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get animal by ID
// @route   GET /api/animals/:id
// @access  Private
export const getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (animal) {
      res.json(animal);
    } else {
      res.status(404).json({ message: 'Animal record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new animal record
// @route   POST /api/animals
// @access  Private
export const createAnimal = async (req, res) => {
  const { tagId, species, breed, ageWeeks, houseNumber, healthStatus, weight, statusNotes } = req.body;

  try {
    const tagExists = await Animal.findOne({ tagId: tagId.trim() });
    if (tagExists) {
      return res.status(400).json({ message: `Animal with Tag ID '${tagId}' already exists` });
    }

    const animal = await Animal.create({
      tagId: tagId.trim(),
      species,
      breed,
      ageWeeks: Number(ageWeeks),
      houseNumber,
      healthStatus: healthStatus || 'Healthy',
      weight: Number(weight),
      statusNotes: statusNotes || '',
      recordedBy: req.user._id,
    });

    res.status(201).json(animal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update animal record
// @route   PUT /api/animals/:id
// @access  Private
export const updateAnimal = async (req, res) => {
  const { breed, ageWeeks, houseNumber, healthStatus, weight, statusNotes } = req.body;

  try {
    const animal = await Animal.findById(req.params.id);

    if (animal) {
      animal.breed = breed || animal.breed;
      animal.ageWeeks = ageWeeks !== undefined ? Number(ageWeeks) : animal.ageWeeks;
      animal.houseNumber = houseNumber || animal.houseNumber;
      animal.healthStatus = healthStatus || animal.healthStatus;
      animal.weight = weight !== undefined ? Number(weight) : animal.weight;
      animal.statusNotes = statusNotes !== undefined ? statusNotes : animal.statusNotes;

      const updatedAnimal = await animal.save();
      res.json(updatedAnimal);
    } else {
      res.status(404).json({ message: 'Animal record not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete animal record
// @route   DELETE /api/animals/:id
// @access  Private/Admin Only
export const deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);

    if (animal) {
      await animal.deleteOne();
      res.json({ message: 'Animal record removed successfully' });
    } else {
      res.status(404).json({ message: 'Animal record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
