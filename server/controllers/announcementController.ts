import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Announcement } from '../models/Announcement';
import { logger } from '../utils/logger';

export async function getAnnouncements(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    let announcements = await (Announcement as any).find().sort({ createdAt: -1 });
    if (announcements.length === 0) {
      // Seed default announcement if empty
      announcements = await (Announcement as any).insertMany([
        {
          title: 'Fall Semester Registration & Hall Tickets Open',
          content: 'Students can now log in to review course registration schedules, verify fee payments, and view download links for hall tickets.',
          department: 'Academic Affairs',
          priority: 'important',
          authorName: 'Office of the Registrar',
          authorId: req.user?.id || '650000000000000000000001',
        },
        {
          title: 'Hostel Maintenance & Security Briefing',
          content: 'All hostel residents are requested to verify their biometric access cards at the main security gate prior to the upcoming holiday weekend.',
          department: 'Hostels & Housing',
          priority: 'info',
          authorName: 'Hostel Warden Office',
          authorId: req.user?.id || '650000000000000000000001',
        },
      ]);
    }
    res.json({ success: true, announcements });
  } catch (error: any) {
    logger.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
  }
}

export async function createAnnouncement(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, content, department, priority } = req.body;
    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required' });
      return;
    }

    const announcement = new Announcement({
      title,
      content,
      department: department || 'General',
      priority: priority || 'info',
      authorName: req.user?.email || 'University Admin',
      authorId: req.user?.id,
    });

    await announcement.save();
    res.status(201).json({ success: true, announcement });
  } catch (error: any) {
    logger.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
}

export async function deleteAnnouncement(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await (Announcement as any).findByIdAndDelete(id);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to delete announcement' });
  }
}
