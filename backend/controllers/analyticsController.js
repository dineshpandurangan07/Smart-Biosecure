import User from '../models/User.js';
import Animal from '../models/Animal.js';
import Visitor from '../models/Visitor.js';
import FeedManagement from '../models/FeedManagement.js';
import SanitationReport from '../models/SanitationReport.js';
import Disease from '../models/Disease.js';
import Vaccination from '../models/Vaccination.js';

// @desc    Get consolidated statistics for Admin & Farmer Dashboards
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Animal counts
    const totalAnimals = await Animal.countDocuments({});
    const pigCount = await Animal.countDocuments({ species: 'Pig' });
    const poultryCount = await Animal.countDocuments({ species: 'Poultry' });

    // 2. Health distribution
    const healthyCount = await Animal.countDocuments({ healthStatus: 'Healthy' });
    const sickCount = await Animal.countDocuments({ healthStatus: 'Sick' });
    const quarantineCount = await Animal.countDocuments({ healthStatus: 'Quarantined' });
    const treatedCount = await Animal.countDocuments({ healthStatus: 'Treated' });

    // 3. Visitor Metrics
    const totalVisitors = await Visitor.countDocuments({});
    const activeVisitors = await Visitor.countDocuments({ exitTime: null });
    const disinfectedVisitors = await Visitor.countDocuments({ disinfectionStatus: true });
    const disinfectionRate = totalVisitors > 0 ? Math.round((disinfectedVisitors / totalVisitors) * 100) : 100;

    // 4. Sanitation Metrics
    const sanitationRecords = await SanitationReport.find({}).sort({ timestamp: -1 }).limit(10);
    const avgSanitationScore = sanitationRecords.length > 0
      ? Number((sanitationRecords.reduce((acc, curr) => acc + curr.cleanlinessScore, 0) / sanitationRecords.length).toFixed(1))
      : 8.5;

    // 5. Feed Stock Summaries (grouped by species or type)
    const feeds = await FeedManagement.find({});
    const feedStockTotal = feeds.reduce((acc, curr) => acc + curr.quantityKg, 0);

    // 6. Recent Disease Reports
    const recentDiseases = await Disease.find({})
      .populate('reportedBy', 'name')
      .sort({ reportDate: -1 })
      .limit(5);

    // 7. Vaccination Status
    const today = new Date();
    // Update scheduled to overdue in flight
    await Vaccination.updateMany(
      { status: 'Scheduled', nextDueDate: { $lt: today } },
      { status: 'Overdue' }
    );
    const totalVaccinations = await Vaccination.countDocuments({});
    const administeredVaccinations = await Vaccination.countDocuments({ status: 'Administered' });
    const scheduledVaccinations = await Vaccination.countDocuments({ status: 'Scheduled' });
    const overdueVaccinations = await Vaccination.countDocuments({ status: 'Overdue' });

    // 8. Weekly sanitation timeline
    const sanitationTimeline = await SanitationReport.find({})
      .sort({ timestamp: 1 })
      .limit(15)
      .select('area cleanlinessScore timestamp');

    // 9. Animal weight analytics
    const animalWeights = await Animal.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select('tagId species breed weight ageWeeks');

    res.json({
      summary: {
        totalAnimals,
        pigCount,
        poultryCount,
        feedStockTotal,
        avgSanitationScore,
        disinfectionRate,
        activeVisitors,
        overdueVaccinations,
      },
      healthDistribution: {
        healthy: healthyCount,
        sick: sickCount,
        quarantined: quarantineCount,
        treated: treatedCount,
      },
      vaccinationStats: {
        total: totalVaccinations,
        administered: administeredVaccinations,
        scheduled: scheduledVaccinations,
        overdue: overdueVaccinations,
      },
      visitorStats: {
        total: totalVisitors,
        active: activeVisitors,
        disinfected: disinfectedVisitors,
      },
      recentDiseases,
      sanitationTimeline,
      animalWeights,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Live simulated IoT parameter stream
// @route   GET /api/analytics/iot-stream
// @access  Private
export const getIoTStream = async (req, res) => {
  try {
    // Generate minor fluctuations around standard healthy ranges
    // Temperature: Pigs (18-22°C), Poultry (21-25°C)
    // Humidity: 50-70%
    // Ammonia: < 15 ppm (safe), > 20 ppm (dangerous alert!)
    // Water pressure: 30-40 PSI
    
    const randomShift = (min, max) => Math.random() * (max - min) + min;

    const pigShedTemp = Number((20.2 + randomShift(-1.5, 1.5)).toFixed(1));
    const poultryCoopTemp = Number((22.8 + randomShift(-1.2, 1.2)).toFixed(1));
    
    const pigShedHumidity = Math.round(62 + randomShift(-5, 5));
    const poultryCoopHumidity = Math.round(58 + randomShift(-4, 4));

    const pigAmmonia = Number((8.4 + randomShift(-2, 2.5)).toFixed(1));
    // Simulated ammonia leak trigger
    const poultryAmmonia = Number((12.1 + randomShift(-3, 6)).toFixed(1)); 

    const waterFlowPig = Number((3.5 + randomShift(-0.5, 0.5)).toFixed(2));
    const waterFlowPoultry = Number((4.1 + randomShift(-0.4, 0.4)).toFixed(2));

    const biosecurityScore = Math.round(92 + randomShift(-3, 4)); // overall score

    res.json({
      timestamp: new Date(),
      sensors: [
        {
          id: 'SEN-PIG-TEMP',
          name: 'Pig Shed A Temperature',
          value: pigShedTemp,
          unit: '°C',
          status: pigShedTemp > 23 ? 'Warning' : 'Normal',
          threshold: '15-22',
        },
        {
          id: 'SEN-PLT-TEMP',
          name: 'Poultry Coop 2 Temperature',
          value: poultryCoopTemp,
          unit: '°C',
          status: poultryCoopTemp > 25 ? 'Warning' : 'Normal',
          threshold: '18-24',
        },
        {
          id: 'SEN-PIG-HUM',
          name: 'Pig Shed A Humidity',
          value: pigShedHumidity,
          unit: '%',
          status: 'Normal',
          threshold: '50-70',
        },
        {
          id: 'SEN-PLT-HUM',
          name: 'Poultry Coop 2 Humidity',
          value: poultryCoopHumidity,
          unit: '%',
          status: 'Normal',
          threshold: '50-70',
        },
        {
          id: 'SEN-PIG-NH3',
          name: 'Pig Shed A Ammonia',
          value: pigAmmonia,
          unit: 'ppm',
          status: pigAmmonia > 15 ? 'Warning' : 'Normal',
          threshold: '< 15',
        },
        {
          id: 'SEN-PLT-NH3',
          name: 'Poultry Coop 2 Ammonia',
          value: poultryAmmonia,
          unit: 'ppm',
          status: poultryAmmonia > 18 ? 'Danger' : (poultryAmmonia > 14 ? 'Warning' : 'Normal'),
          threshold: '< 15',
        },
        {
          id: 'SEN-WTR-PIG',
          name: 'Pig Shed A Water Flow',
          value: waterFlowPig,
          unit: 'L/min',
          status: 'Normal',
          threshold: '2-5',
        },
        {
          id: 'SEN-WTR-PLT',
          name: 'Poultry Coop 2 Water Flow',
          value: waterFlowPoultry,
          unit: 'L/min',
          status: 'Normal',
          threshold: '2-5',
        },
      ],
      biosecurityScore: biosecurityScore > 100 ? 100 : biosecurityScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
