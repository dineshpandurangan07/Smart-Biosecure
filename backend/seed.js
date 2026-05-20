import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Animal from './models/Animal.js';
import Vaccination from './models/Vaccination.js';
import Visitor from './models/Visitor.js';
import Disease from './models/Disease.js';
import FeedManagement from './models/FeedManagement.js';
import SanitationReport from './models/SanitationReport.js';
import Notification from './models/Notification.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/biosecure_farm';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('Database connected. Clearing existing collections...');

    // Delete existing records
    await User.deleteMany({});
    await Animal.deleteMany({});
    await Vaccination.deleteMany({});
    await Visitor.deleteMany({});
    await Disease.deleteMany({});
    await FeedManagement.deleteMany({});
    await SanitationReport.deleteMany({});
    await Notification.deleteMany({});

    console.log('Existing collections cleared. Seeding Users...');

    // Create Default Users
    // Admin User
    const adminPassword = await bcrypt.hash('password123', 10);
    const adminUser = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'admin@farm.com',
      password: 'password123', // password pre-save hook handles hashing usually, but since we create directly we can just pass plain string, let's verify if create triggers save hook - yes it does. Let's pass plain password and mongoose will hash it. Or we pass 'password123'. Let's pass 'password123' because create invokes save hook.
      role: 'admin',
      farmName: 'BioShield Agro-Plex',
      farmType: 'both',
      phone: '+1 (555) 019-2834',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah',
    });

    // Farmer User
    const farmerUser = await User.create({
      name: 'Robert Miller',
      email: 'farmer@farm.com',
      password: 'password123',
      role: 'farmer',
      farmName: 'BioShield Agro-Plex',
      farmType: 'both',
      phone: '+1 (555) 014-9922',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Robert',
    });

    console.log('Seeded Users successfully. Seeding Animals...');

    // Create Animals
    const animalsList = [
      { tagId: 'PIG-0012', species: 'Pig', breed: 'Landrace', ageWeeks: 12, houseNumber: 'Shed A', healthStatus: 'Healthy', weight: 45.2 },
      { tagId: 'PIG-0013', species: 'Pig', breed: 'Landrace', ageWeeks: 12, houseNumber: 'Shed A', healthStatus: 'Healthy', weight: 46.8 },
      { tagId: 'PIG-0024', species: 'Pig', breed: 'Yorkshire', ageWeeks: 18, houseNumber: 'Shed B', healthStatus: 'Healthy', weight: 92.5 },
      { tagId: 'PIG-0025', species: 'Pig', breed: 'Yorkshire', ageWeeks: 18, houseNumber: 'Shed B', healthStatus: 'Treated', weight: 89.1, statusNotes: 'Recovered from mild respiratory congestion.' },
      { tagId: 'PIG-0036', species: 'Pig', breed: 'Duroc', ageWeeks: 8, houseNumber: 'Shed C', healthStatus: 'Healthy', weight: 22.4 },
      { tagId: 'PIG-0037', species: 'Pig', breed: 'Duroc', ageWeeks: 8, houseNumber: 'Shed C', healthStatus: 'Quarantined', weight: 19.5, statusNotes: 'Showing lethargy and skin rashes. AI flagged High Risk.' },
      
      { tagId: 'PLT-5001', species: 'Poultry', breed: 'Broiler (Cobb 500)', ageWeeks: 4, houseNumber: 'Coop 1', healthStatus: 'Healthy', weight: 1.4 },
      { tagId: 'PLT-5002', species: 'Poultry', breed: 'Broiler (Cobb 500)', ageWeeks: 4, houseNumber: 'Coop 1', healthStatus: 'Healthy', weight: 1.5 },
      { tagId: 'PLT-6104', species: 'Poultry', breed: 'Layer (Leghorn)', ageWeeks: 24, houseNumber: 'Coop 2', healthStatus: 'Healthy', weight: 2.1 },
      { tagId: 'PLT-6105', species: 'Poultry', breed: 'Layer (Leghorn)', ageWeeks: 24, houseNumber: 'Coop 2', healthStatus: 'Healthy', weight: 2.2 },
      { tagId: 'PLT-7208', species: 'Poultry', breed: 'Turkey (Broad Breasted White)', ageWeeks: 10, houseNumber: 'Coop 3', healthStatus: 'Sick', weight: 5.6, statusNotes: 'Sneezing and water discharge from eyes.' },
    ];

    const seededAnimals = await Animal.insertMany(
      animalsList.map(a => ({ ...a, recordedBy: farmerUser._id }))
    );

    console.log('Seeded Animals successfully. Seeding Vaccinations...');

    // Create Vaccinations
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const expiredDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);

    const vaccinationsList = [
      { animalTag: 'PIG-0012', vaccineName: 'Circovirus Vaccine', diseaseTargeted: 'PCV2', doseNumber: 1, dateAdministered: oneWeekAgo, nextDueDate: oneWeekLater, status: 'Administered', administeredBy: 'Robert Miller' },
      { animalTag: 'PIG-0013', vaccineName: 'Circovirus Vaccine', diseaseTargeted: 'PCV2', doseNumber: 1, dateAdministered: oneWeekAgo, nextDueDate: oneWeekLater, status: 'Administered', administeredBy: 'Robert Miller' },
      { animalTag: 'PIG-0024', vaccineName: 'Erysipelas Bacterin', diseaseTargeted: 'Swine Erysipelas', doseNumber: 2, dateAdministered: null, nextDueDate: oneWeekLater, status: 'Scheduled' },
      { animalTag: 'PIG-0036', vaccineName: 'Mycoplasma Vaccine', diseaseTargeted: 'Enzootic Pneumonia', doseNumber: 1, dateAdministered: null, nextDueDate: twoWeeksLater, status: 'Scheduled' },
      { animalTag: 'PIG-0037', vaccineName: 'Swine Influenza Shot', diseaseTargeted: 'H1N1 / H3N2', doseNumber: 1, dateAdministered: null, nextDueDate: expiredDate, status: 'Overdue' }, // Overdue vaccination
      
      { animalTag: 'PLT-5001', species: 'Poultry', vaccineName: 'Newcastle B1 Strain', diseaseTargeted: 'Newcastle Disease', doseNumber: 1, dateAdministered: oneWeekAgo, nextDueDate: oneWeekLater, status: 'Administered', administeredBy: 'Robert Miller' },
      { animalTag: 'PLT-6104', species: 'Poultry', vaccineName: 'Mareks Disease Vaccine', diseaseTargeted: 'Mareks Disease', doseNumber: 2, dateAdministered: null, nextDueDate: twoWeeksLater, status: 'Scheduled' },
      { animalTag: 'PLT-7208', species: 'Poultry', vaccineName: 'Infectious Bronchitis', diseaseTargeted: 'Avian IB', doseNumber: 1, dateAdministered: null, nextDueDate: expiredDate, status: 'Overdue' },
    ];

    await Vaccination.insertMany(vaccinationsList);

    console.log('Seeded Vaccinations successfully. Seeding Visitors...');

    // Create Visitors
    const visitorsList = [
      { fullName: 'Dr. James Carter', purpose: 'Veterinary Biosecurity Audit', vehicleNumber: 'TX-432-APP', entryTime: new Date(today.getTime() - 2 * 60 * 60 * 1000), exitTime: null, disinfectionStatus: true, contactNumber: '+1 (555) 018-9321', allowedAccess: true, approvedBy: adminUser._id },
      { fullName: 'Marcus Vance', purpose: 'Feed Delivery (Cargill Corp)', vehicleNumber: 'MN-992-HVY', entryTime: new Date(today.getTime() - 5 * 60 * 60 * 1000), exitTime: new Date(today.getTime() - 4 * 60 * 60 * 1000), disinfectionStatus: true, contactNumber: '+1 (555) 012-4411', allowedAccess: true, approvedBy: farmerUser._id },
      { fullName: 'Thomas Alva', purpose: 'Electrical Maintenance', vehicleNumber: 'TX-104-SVC', entryTime: new Date(today.getTime() - 25 * 60 * 60 * 1000), exitTime: new Date(today.getTime() - 23 * 60 * 60 * 1000), disinfectionStatus: true, contactNumber: '+1 (555) 017-3829', allowedAccess: true, approvedBy: farmerUser._id },
      { fullName: 'Jane Cooper', purpose: 'Prospective Buyer Tour', vehicleNumber: 'CA-902-VIP', entryTime: new Date(today.getTime() - 30 * 60 * 60 * 1000), exitTime: new Date(today.getTime() - 29 * 60 * 60 * 1000), disinfectionStatus: false, contactNumber: '+1 (555) 019-3382', allowedAccess: false, approvedBy: null },
    ];

    await Visitor.insertMany(visitorsList);

    console.log('Seeded Visitors successfully. Seeding Disease Reports...');

    // Create Disease incidents
    const diseasesList = [
      {
        animalTag: 'PIG-0037',
        species: 'Pig',
        symptoms: ['High Fever', 'Skin Discoloration', 'Red Spots', 'Lethargy'],
        severity: 'Critical',
        reportedBy: farmerUser._id,
        reportDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: 'Investigating',
        quarantineEnforced: true,
        aiRiskScore: 95,
        treatmentPlan: 'CRITICAL ALERT: Suspected African Swine Fever. Immediate action required. Enforce total quarantine of Shed. Ban all vehicle entry/exit. Notify government veterinary officers immediately. Implement strict footbaths and clothing changes. Disinfect the entire block with 1% Virkon S.',
      },
      {
        animalTag: 'PLT-7208',
        species: 'Poultry',
        symptoms: ['Sneezing', 'Loose Droppings', 'Respiratory Discharge'],
        severity: 'Medium',
        reportedBy: farmerUser._id,
        reportDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        status: 'Reported',
        quarantineEnforced: true,
        aiRiskScore: 40,
        treatmentPlan: 'MEDIUM RISK: Coccidiosis / Infectious Bronchitis suspected. Treat poultry flock with amprolium or approved anticoccidials. Ensure dry litter. Change wet spots around drinkers immediately. Improve ventilation rate.',
      },
      {
        animalTag: 'PIG-0025',
        species: 'Pig',
        symptoms: ['Coughing', 'Sneezing'],
        severity: 'Low',
        reportedBy: farmerUser._id,
        reportDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
        status: 'Resolved',
        quarantineEnforced: false,
        aiRiskScore: 25,
        treatmentPlan: 'Swine Influenza suspected. Resolved successfully after antibiotics and rest.',
      }
    ];

    await Disease.insertMany(diseasesList);

    console.log('Seeded Diseases successfully. Seeding Feed Management...');

    // Create Feed stock log
    const feedList = [
      { feedType: 'Starter Mash (Poultry)', species: 'Poultry', quantityKg: 1200, batchNumber: 'BAT-PLT-2049', deliveryDate: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000), qualityCheck: true, storageTemp: 19.5, notes: 'Delivered by Cargill. High-protein booster for young chicks.' },
      { feedType: 'Grower Pellets (Pig)', species: 'Pig', quantityKg: 3500, batchNumber: 'BAT-PIG-4492', deliveryDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), qualityCheck: true, storageTemp: 21.0, notes: 'Premium standard growth pellets. Tested clean of moisture or pest infestation.' },
      { feedType: 'Finisher Mash (Poultry)', species: 'Poultry', quantityKg: 2200, batchNumber: 'BAT-PLT-8839', deliveryDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000), qualityCheck: true, storageTemp: 20.0, notes: 'Weight consolidation blend.' },
      { feedType: 'Sow Feeding Meal', species: 'Pig', quantityKg: 800, batchNumber: 'BAT-PIG-1002', deliveryDate: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000), qualityCheck: false, storageTemp: 25.2, notes: 'WARNING: Rejected due to container puncture on truck. Returned to manufacturer.' }
    ];

    await FeedManagement.insertMany(feedList);

    console.log('Seeded Feed successfully. Seeding Sanitation Reports...');

    // Create Sanitation reports
    const sanitationList = [
      { area: 'Shed A (Gilt & Sow Housing)', cleanerName: 'Robert Miller', disinfectantUsed: 'Virkon S', concentration: '1%', timestamp: new Date(today.getTime() - 3 * 60 * 60 * 1000), cleanlinessScore: 9, notes: 'Slats scrubbed. Feed troughs cleaned and thoroughly dried.' },
      { area: 'Coop 2 (Egg Layer Pen)', cleanerName: 'Robert Miller', disinfectantUsed: 'Glutaraldehyde', concentration: '0.5%', timestamp: new Date(today.getTime() - 6 * 60 * 60 * 1000), cleanlinessScore: 8, notes: 'Bedding turned over and new dry litter laydown.' },
      { area: 'Visitor Disinfection Gate', cleanerName: 'Thomas Alva', disinfectantUsed: 'Virkon S', concentration: '2%', timestamp: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), cleanlinessScore: 10, notes: 'Pressure nozzle systems cleaned and filled with active disinfectant solution.' },
      { area: 'Feed Storage Area', cleanerName: 'Jane Cooper', disinfectantUsed: 'Bleach', concentration: '5%', timestamp: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), cleanlinessScore: 7, notes: 'Broom sweeps completed. Pests traps checked.' }
    ];

    await SanitationReport.insertMany(sanitationList);

    console.log('Seeded Sanitation successfully. Seeding Notifications...');

    // Create Notifications
    const notificationsList = [
      { title: 'CRITICAL DISEASE ALERT: African Swine Fever (ASF) Suspected', message: 'A high-risk disease has been reported in Pig (PIG-0037). AI Risk Score: 95%. Quarantine is strictly recommended.', type: 'alert', read: false },
      { title: 'Overdue Vaccination Alert', message: 'Vaccination (Swine Influenza Shot) for PIG-0037 is past its scheduled date!', type: 'warning', read: false },
      { title: 'Visitor Awaiting Biosecurity Clearance', message: 'Dr. James Carter is logged at the visitor gate requiring biosecurity approval.', type: 'info', read: false },
      { title: 'Sanitation Audit Checklist Complete', message: 'Visitor Disinfection Gate scored 10/10 in modern cleanliness audit.', type: 'success', read: true }
    ];

    await Notification.insertMany(notificationsList);

    console.log('\n===============================================');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Admin account: admin@farm.com (password: password123)');
    console.log('Farmer account: farmer@farm.com (password: password123)');
    console.log('===============================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
