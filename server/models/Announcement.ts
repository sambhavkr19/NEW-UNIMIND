import mongoose, { Schema } from 'mongoose';

const AnnouncementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['info', 'important', 'urgent'],
      default: 'info',
    },
    authorName: {
      type: String,
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement =
  mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
