import Vaccination from '../models/Vaccination.js';

// @desc    Get all vaccinations with optional status filter
// @route   GET /api/vaccinations
// @access  Private
export const getVaccinations = async (req, res) => {
  const { status, animalTag } = req.query;
  let query = {};

  if (status) query.status = status;
  if (animalTag) query.animalTag = { $regex: animalTag, $options: 'i' };

  try {
    // Check if any scheduled vaccinations are overdue and update their status in-flight
    const today = new Date();
    await Vaccination.updateMany(
      { status: 'Scheduled', nextDueDate: { $lt: today } },
      { status: 'Overdue' }
    );

    const vaccinations = await Vaccination.find(query).sort({ nextDueDate: 1 });
    res.json(vaccinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create/Schedule a vaccination
// @route   POST /api/vaccinations
// @access  Private
export const createVaccination = async (req, res) => {
  const { animalTag, vaccineName, diseaseTargeted, doseNumber, nextDueDate, status, dateAdministered, administeredBy } = req.body;

  try {
    const today = new Date();
    let computedStatus = status || 'Scheduled';
    
    // Determine status automatically if nextDueDate is set
    if (computedStatus === 'Scheduled' && nextDueDate && new Date(nextDueDate) < today) {
      computedStatus = 'Overdue';
    }

    const vaccination = await Vaccination.create({
      animalTag: animalTag.trim().toUpperCase(),
      vaccineName,
      diseaseTargeted,
      doseNumber: Number(doseNumber) || 1,
      dateAdministered: dateAdministered ? new Date(dateAdministered) : null,
      nextDueDate: new Date(nextDueDate),
      status: dateAdministered ? 'Administered' : computedStatus,
      administeredBy: administeredBy || '',
    });

    res.status(201).json(vaccination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a vaccination record (e.g. mark as administered or reschedule)
// @route   PUT /api/vaccinations/:id
// @access  Private
export const updateVaccination = async (req, res) => {
  const { status, dateAdministered, administeredBy, nextDueDate, doseNumber } = req.body;

  try {
    const vaccination = await Vaccination.findById(req.params.id);

    if (vaccination) {
      vaccination.doseNumber = doseNumber !== undefined ? Number(doseNumber) : vaccination.doseNumber;
      vaccination.administeredBy = administeredBy !== undefined ? administeredBy : vaccination.administeredBy;
      
      if (nextDueDate) {
        vaccination.nextDueDate = new Date(nextDueDate);
      }

      if (status === 'Administered') {
        vaccination.status = 'Administered';
        vaccination.dateAdministered = dateAdministered ? new Date(dateAdministered) : new Date();
      } else if (status) {
        vaccination.status = status;
        if (status === 'Scheduled' || status === 'Overdue') {
          vaccination.dateAdministered = null;
        }
      }

      // Re-evaluate if status is scheduled but due date is in the past
      const today = new Date();
      if (vaccination.status === 'Scheduled' && vaccination.nextDueDate < today) {
        vaccination.status = 'Overdue';
      }

      const updatedVaccination = await vaccination.save();
      res.json(updatedVaccination);
    } else {
      res.status(404).json({ message: 'Vaccination record not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get active/overdue vaccination alerts for the reminder system
// @route   GET /api/vaccinations/reminders
// @access  Private
export const getVaccinationReminders = async (req, res) => {
  try {
    const today = new Date();
    // Update overdue states in-flight
    await Vaccination.updateMany(
      { status: 'Scheduled', nextDueDate: { $lt: today } },
      { status: 'Overdue' }
    );

    // Fetch scheduled and overdue entries
    const reminders = await Vaccination.find({
      status: { $in: ['Scheduled', 'Overdue'] },
    }).sort({ nextDueDate: 1 });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete vaccination
// @route   DELETE /api/vaccinations/:id
// @access  Private/Admin Only
export const deleteVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);
    if (vaccination) {
      await vaccination.deleteOne();
      res.json({ message: 'Vaccination record deleted successfully' });
    } else {
      res.status(404).json({ message: 'Vaccination record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
