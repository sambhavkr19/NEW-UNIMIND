import { Response } from 'express';
import { Ticket } from '../models/Ticket';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

/**
 * Get all support tickets
 * - Students: returns only their tickets
 * - Admins: returns all tickets
 */
export async function getTickets(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let tickets;
    if (req.user.role === 'admin') {
      tickets = await (Ticket as any).find().sort({ createdAt: -1 });
    } else {
      tickets = await (Ticket as any).find({ studentId: req.user.id }).sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      tickets,
    });
  } catch (error: any) {
    logger.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message,
    });
  }
}

/**
 * Create a new ticket manually
 */
export async function createTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { title, question, department, priority } = req.body;

    if (!question) {
      res.status(400).json({ success: false, message: 'The ticket question/description is required' });
      return;
    }

    const student = await (User as any).findById(req.user.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student user not found' });
      return;
    }

    const ticketTitle = title || question.split(/\s+/).slice(0, 5).join(' ') || 'Inquiry';

    const ticket = await (Ticket as any).create({
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      title: ticketTitle,
      question,
      department: department || 'general',
      priority: priority || 'medium',
      status: 'open',
    });

    res.status(201).json({
      success: true,
      ticket,
    });
  } catch (error: any) {
    logger.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: error.message,
    });
  }
}

/**
 * Update a ticket's status, department, or priority (primarily for admins)
 */
export async function updateTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status, department, priority } = req.body;

    const ticket = await (Ticket as any).findById(id);
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    // Permission check: Students can only update status to closed of their own tickets
    if (req.user.role !== 'admin') {
      if (ticket.studentId.toString() !== req.user.id) {
        res.status(403).json({ success: false, message: 'Access denied to update this ticket' });
        return;
      }
      
      // Students can only change status to closed
      if (status && status === 'closed') {
        ticket.status = 'closed';
      } else {
        res.status(403).json({ success: false, message: 'Students can only close their own tickets' });
        return;
      }
    } else {
      // Admins can update everything
      if (status) ticket.status = status;
      if (department) ticket.department = department;
      if (priority) ticket.priority = priority;
    }

    await ticket.save();

    res.json({
      success: true,
      ticket,
    });
  } catch (error: any) {
    logger.error('Error updating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket',
      error: error.message,
    });
  }
}

/**
 * Delete a ticket
 */
export async function deleteTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only admins can delete tickets' });
      return;
    }

    const { id } = req.params;
    const ticket = await (Ticket as any).findByIdAndDelete(id);

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Ticket deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error deleting ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ticket',
      error: error.message,
    });
  }
}
