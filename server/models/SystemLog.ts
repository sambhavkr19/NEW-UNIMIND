import mongoose, { Schema } from 'mongoose';

const SystemLogSchema = new Schema(
  {
    level: {
      type: String,
      enum: ['info', 'warn', 'error'],
      default: 'info',
    },
    component: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const SystemLog = mongoose.models.SystemLog || mongoose.model('SystemLog', SystemLogSchema);
