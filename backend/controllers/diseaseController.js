import User from '../models/User.js';
import Disease from '../models/Disease.js';
import Notification from '../models/Notification.js';

// Rule-based AI Disease Risk Evaluator Helper
const evaluateAIDiagnosis = (species, symptoms, severity) => {
  let score = 20; // base score
  let detectedDisease = 'Undetermined Pathogen';
  let quarantineRecommended = false;
  let plan = '';

  const symptomList = symptoms.map(s => s.toLowerCase());

  if (severity === 'Critical') score += 30;
  else if (severity === 'High') score += 20;
  else if (severity === 'Medium') score += 10;

  if (species === 'Pig') {
    // Check Pig diseases
    const hasFever = symptomList.some(s => s.includes('fever') || s.includes('temp'));
    const hasSkinLesions = symptomList.some(s => s.includes('lesion') || s.includes('red spots') || s.includes('discolor'));
    const hasRespiratory = symptomList.some(s => s.includes('cough') || s.includes('breath') || s.includes('sneeze'));
    const hasLethargy = symptomList.some(s => s.includes('letharg') || s.includes('weak') || s.includes('feed'));
    const hasHighMortality = symptomList.some(s => s.includes('death') || s.includes('mortality') || s.includes('dying'));

    if (hasFever && hasSkinLesions && hasHighMortality) {
      detectedDisease = 'African Swine Fever (ASF) Suspected';
      score += 45;
      quarantineRecommended = true;
      plan = 'CRITICAL ALERT: Suspected African Swine Fever. Immediate action required. Enforce total quarantine of Shed. Ban all vehicle entry/exit. Notify government veterinary officers immediately. Implement strict footbaths and clothing changes. Disinfect the entire block with 1% Virkon S.';
    } else if (hasFever && hasRespiratory && hasLethargy) {
      detectedDisease = 'Swine Influenza suspected';
      score += 25;
      quarantineRecommended = true;
      plan = 'HIGH RISK: Suspected Swine Influenza. Isolate infected swine to quarantine pens. Improve ventilation. Provide supportive electrolyte therapy. Personnel must wear N95 respirators. Limit movement between pens.';
    } else if (hasRespiratory && hasLethargy) {
      detectedDisease = 'Porcine Reproductive and Respiratory Syndrome (PRRS)';
      score += 20;
      quarantineRecommended = true;
      plan = 'MEDIUM RISK: PRRS assessment indicates respiratory issues. Isolate affected animals. Ensure feed storage is strictly pest-free. Disinfect water lines. Review booster vaccination schedules.';
    } else {
      detectedDisease = 'General Swine Gastrointestinal / Parasitic Infection';
      score += 10;
      plan = 'LOW-MEDIUM RISK: General infection. Isolate sick pigs. Clean and scrape dung from slats. Provide fresh bedding and administer electrolytes in water. Monitor temperature daily.';
    }
  } else if (species === 'Poultry') {
    // Check Poultry diseases
    const hasRespiratory = symptomList.some(s => s.includes('cough') || s.includes('wheez') || s.includes('breath') || s.includes('snick'));
    const hasNeurological = symptomList.some(s => s.includes('paraly') || s.includes('twist') || s.includes('tremor'));
    const hasDiarrhea = symptomList.some(s => s.includes('diarrh') || s.includes('droppings') || s.includes('loose'));
    const hasHighMortality = symptomList.some(s => s.includes('death') || s.includes('mortality') || s.includes('dying'));
    const hasSwelling = symptomList.some(s => s.includes('swell') || s.includes('comb') || s.includes('wattl'));

    if (hasHighMortality && hasRespiratory && (hasNeurological || hasSwelling)) {
      detectedDisease = 'Highly Pathogenic Avian Influenza (HPAI) Suspected';
      score += 50;
      quarantineRecommended = true;
      plan = 'CRITICAL ALERT: Suspected Avian Influenza (Bird Flu). High biosecurity alert. Quarantine the entire coop block immediately. Restrict all human access except authorized vets wearing full PPE. Depopulation protocols might be required. Seal feed bins to exclude wild birds.';
    } else if (hasRespiratory && hasNeurological) {
      detectedDisease = 'Newcastle Disease (ND) Suspected';
      score += 35;
      quarantineRecommended = true;
      plan = 'HIGH RISK: Suspected Newcastle Disease. Isolate coop. Spray disinfectant mist in the house. Ensure footbaths are loaded with active disinfectant. Administer vitamin boosters. Halt manure disposal activities.';
    } else if (hasDiarrhea && hasRespiratory) {
      detectedDisease = 'Coccidiosis / Infectious Bronchitis suspected';
      score += 15;
      plan = 'MEDIUM RISK: Coccidiosis assessment. Treat poultry flock with amprolium or approved anticoccidials. Ensure dry litter. Change wet spots around drinkers immediately. Improve ventilation rate.';
    } else {
      detectedDisease = 'General Poultry Respiratory Infection';
      score += 10;
      plan = 'LOW-MEDIUM RISK: Respiratory symptoms reported. Monitor flock mortality. Ensure heaters/fans are operating. Clean the water sanitizers. Keep birds warm and draft-free.';
    }
  }

  // Cap score at 99
  if (score > 99) score = 99;

  return {
    diseaseName: detectedDisease,
    riskScore: score,
    quarantineRecommended,
    plan,
  };
};

// @desc    Get all disease reports
// @route   GET /api/diseases
// @access  Private
export const getDiseases = async (req, res) => {
  try {
    const reports = await Disease.find({})
      .populate('reportedBy', 'name role')
      .sort({ reportDate: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report a disease & trigger AI analysis
// @route   POST /api/diseases
// @access  Private
export const createDiseaseReport = async (req, res) => {
  const { animalTag, species, symptoms, severity, status, quarantineEnforced } = req.body;

  if (!symptoms || symptoms.length === 0) {
    return res.status(400).json({ message: 'At least one symptom must be provided' });
  }

  try {
    // Evaluate via AI Predictor
    const aiResult = evaluateAIDiagnosis(species, symptoms, severity);

    const disease = await Disease.create({
      animalTag: animalTag ? animalTag.trim().toUpperCase() : '',
      species,
      symptoms,
      severity,
      reportedBy: req.user._id,
      status: status || 'Reported',
      quarantineEnforced: quarantineEnforced !== undefined ? quarantineEnforced : aiResult.quarantineRecommended,
      aiRiskScore: aiResult.riskScore,
      treatmentPlan: aiResult.plan,
    });

    // Create system-wide Notification if risk score is high
    if (aiResult.riskScore >= 50) {
      await Notification.create({
        title: `CRITICAL DISEASE ALERT: ${aiResult.diseaseName}`,
        message: `A high-risk disease has been reported in ${species} (${animalTag || 'Shedwide'}). AI Risk Score: ${aiResult.riskScore}%. Quarantine is strictly recommended.`,
        type: 'alert',
      });
    } else {
      await Notification.create({
        title: `New Disease Incident Logged`,
        message: `Disease symptoms in ${species} (${animalTag || 'Shedwide'}) logged with a severity of ${severity}. AI Risk Score: ${aiResult.riskScore}%.`,
        type: 'warning',
      });
    }

    res.status(201).json(disease);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update disease status (e.g. Confirm, Resolve, Enforce Quarantine)
// @route   PUT /api/diseases/:id/status
// @access  Private
export const updateDiseaseStatus = async (req, res) => {
  const { status, quarantineEnforced, treatmentPlan } = req.body;

  try {
    const report = await Disease.findById(req.params.id);

    if (report) {
      report.status = status || report.status;
      report.treatmentPlan = treatmentPlan || report.treatmentPlan;
      
      if (quarantineEnforced !== undefined) {
        report.quarantineEnforced = quarantineEnforced;
      }

      const updatedReport = await report.save();

      // Trigger notification on resolution
      if (status === 'Resolved') {
        await Notification.create({
          title: `Disease Incident Resolved`,
          message: `The reported disease incident for ${report.species} (${report.animalTag || 'Shedwide'}) has been resolved.`,
          type: 'success',
        });
      }

      res.json(updatedReport);
    } else {
      res.status(404).json({ message: 'Disease report not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    AI manual predictor endpoint
// @route   POST /api/diseases/ai-predict
// @access  Private
export const getAIPrediction = async (req, res) => {
  const { species, symptoms, severity } = req.body;

  if (!species || !symptoms || symptoms.length === 0 || !severity) {
    return res.status(400).json({ message: 'Missing parameters for AI analysis' });
  }

  try {
    const aiResult = evaluateAIDiagnosis(species, symptoms, severity);
    res.json(aiResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete disease report
// @route   DELETE /api/diseases/:id
// @access  Private/Admin Only
export const deleteDisease = async (req, res) => {
  try {
    const report = await Disease.findById(req.params.id);
    if (report) {
      await report.deleteOne();
      res.json({ message: 'Disease record removed successfully' });
    } else {
      res.status(404).json({ message: 'Disease record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
