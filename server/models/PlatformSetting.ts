import mongoose, { Schema } from 'mongoose';

const PlatformSettingSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const PlatformSetting =
  mongoose.models.PlatformSetting || mongoose.model('PlatformSetting', PlatformSettingSchema);
