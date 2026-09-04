import mongoose, { Schema } from 'mongoose';

const CollegeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    location: {
      type: String,
      default: 'Main Campus',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    studentCount: {
      type: Number,
      default: 0,
    },
    adminCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const College = mongoose.models.College || mongoose.model('College', CollegeSchema);
