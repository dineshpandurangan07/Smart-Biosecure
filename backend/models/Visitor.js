import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      required: true, // e.g. "Vet Visit", "Feed Delivery", "Audit", "Maintenance"
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    entryTime: {
      type: Date,
      default: Date.now,
    },
    exitTime: {
      type: Date,
      default: null,
    },
    disinfectionStatus: {
      type: Boolean,
      default: false,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    allowedAccess: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Visitor = mongoose.model('Visitor', visitorSchema);
export default Visitor;
