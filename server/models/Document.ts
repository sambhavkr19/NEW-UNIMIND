import mongoose, { Schema } from 'mongoose';

const DocumentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Add text index to make RAG text search fast
DocumentSchema.index({ text: 'text', title: 'text' });

export const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);
