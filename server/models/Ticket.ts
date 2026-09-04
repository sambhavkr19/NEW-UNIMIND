import mongoose, { Schema } from 'mongoose';

const TicketSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Auto-generated Support Ticket',
    },
    question: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      enum: ['academic', 'hostel', 'examination', 'finance', 'general'],
      default: 'general',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
