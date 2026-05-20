import mongoose from 'mongoose';

const sanitationReportSchema = new mongoose.Schema(
  {
    area: {
      type: String,
      required: true, // e.g. "Shed A", "Coop 2", "Visitor Disinfection Gate", "Feed Storage"
    },
    cleanerName: {
      type: String,
      required: true,
    },
    disinfectantUsed: {
      type: String,
      required: true, // e.g. "Virkon S", "Glutaraldehyde", "Bleach"
    },
    concentration: {
      type: String, // e.g. "1%", "200ppm"
      default: '1%',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    cleanlinessScore: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const SanitationReport = mongoose.model('SanitationReport', sanitationReportSchema);
export default SanitationReport;
