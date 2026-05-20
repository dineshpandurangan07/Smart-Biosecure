import mongoose from 'mongoose';

const feedManagementSchema = new mongoose.Schema(
  {
    feedType: {
      type: String,
      required: true, // e.g. "Starter Mash", "Grower Pellets", "Finisher Diet"
    },
    species: {
      type: String,
      enum: ['Pig', 'Poultry', 'General'],
      required: true,
    },
    quantityKg: {
      type: Number,
      required: true,
    },
    batchNumber: {
      type: String,
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    qualityCheck: {
      type: Boolean,
      default: true,
    },
    storageTemp: {
      type: Number, // in Celsius
      default: 20,
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

const FeedManagement = mongoose.model('FeedManagement', feedManagementSchema);
export default FeedManagement;
