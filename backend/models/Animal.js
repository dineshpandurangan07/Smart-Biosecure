import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema(
  {
    tagId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    species: {
      type: String,
      enum: ['Pig', 'Poultry'],
      required: true,
    },
    breed: {
      type: String,
      required: true,
    },
    ageWeeks: {
      type: Number,
      required: true,
    },
    houseNumber: {
      type: String,
      required: true,
    },
    healthStatus: {
      type: String,
      enum: ['Healthy', 'Sick', 'Quarantined', 'Treated'],
      default: 'Healthy',
    },
    weight: {
      type: Number,
      required: true, // in kg
    },
    statusNotes: {
      type: String,
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Animal = mongoose.model('Animal', animalSchema);
export default Animal;
