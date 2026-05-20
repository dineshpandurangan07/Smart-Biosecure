import SanitationReport from '../models/SanitationReport.js';

// @desc    Get all sanitation reports
// @route   GET /api/sanitation
// @access  Private
export const getSanitations = async (req, res) => {
  try {
    const reports = await SanitationReport.find({}).sort({ timestamp: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a sanitation report
// @route   POST /api/sanitation
// @access  Private
export const createSanitation = async (req, res) => {
  const { area, cleanerName, disinfectantUsed, concentration, cleanlinessScore, notes } = req.body;

  try {
    const report = await SanitationReport.create({
      area,
      cleanerName,
      disinfectantUsed,
      concentration: concentration || '1%',
      cleanlinessScore: Number(cleanlinessScore),
      notes: notes || '',
      timestamp: new Date(),
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a sanitation record
// @route   DELETE /api/sanitation/:id
// @access  Private/Admin Only
export const deleteSanitation = async (req, res) => {
  try {
    const report = await SanitationReport.findById(req.params.id);
    if (report) {
      await report.deleteOne();
      res.json({ message: 'Sanitation report deleted successfully' });
    } else {
      res.status(404).json({ message: 'Sanitation report not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
