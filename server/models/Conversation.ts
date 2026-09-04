import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['user', 'model'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ConversationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
