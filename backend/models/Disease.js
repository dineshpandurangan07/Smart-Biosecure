import mongoose from 'mongoose';

const diseaseSchema = new mongoose.Schema(
  {
    animalTag: {
      type: String,
      default: '', // Optional: can report for individual or entire shed
    },
    species: {
      type: String,
      enum: ['Pig', 'Poultry'],
      required: true,
    },
    symptoms: {
      type: [String],
      required: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Reported', 'Investigating', 'Confirmed', 'Resolved'],
      default: 'Reported',
    },
    quarantineEnforced: {
      type: Boolean,
      default: false,
    },
    aiRiskScore: {
      type: Number,
      default: 0, // Filled by our smart AI-predictor (1-100 scale)
    },
    treatmentPlan: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Disease = mongoose.model('Disease', diseaseSchema);
export default Disease;
