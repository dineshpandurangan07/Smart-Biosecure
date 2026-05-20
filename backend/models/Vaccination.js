import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema(
  {
    animalTag: {
      type: String,
      required: true,
      trim: true,
    },
    vaccineName: {
      type: String,
      required: true,
    },
    diseaseTargeted: {
      type: String,
      required: true,
    },
    doseNumber: {
      type: Number,
      default: 1,
    },
    dateAdministered: {
      type: Date,
      default: null,
    },
    nextDueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Administered', 'Scheduled', 'Overdue'],
      default: 'Scheduled',
    },
    administeredBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Vaccination = mongoose.model('Vaccination', vaccinationSchema);
export default Vaccination;
