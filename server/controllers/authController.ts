import { Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { getDBStatus } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function registerStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, email, password, department, studentId, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const dbStatus = getDBStatus();

    if (!dbStatus.isConnected) {
      res.status(503).json({
        success: false,
        message: 'Database is offline. Please try again shortly.',
      });
      return;
    }

    // Real MongoDB Registration
    const existingUser = await (User as any).findOne({ email: emailLower });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    const newUser = new User({
      name,
      email: emailLower,
      password, // Pre-save hook hashes it automatically
      role: ['admin', 'college_admin', 'platform_admin'].includes(role) ? role : 'student',
      department,
      studentId: ['admin', 'college_admin', 'platform_admin'].includes(role) ? undefined : studentId,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });

    await newUser.save();

    const token = generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        studentId: newUser.studentId,
        avatarUrl: newUser.avatarUrl,
      },
    });
  } catch (error: any) {
    logger.error('Error in student registration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      error: error.message,
    });
  }
}

export async function loginUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const dbStatus = getDBStatus();

    if (!dbStatus.isConnected) {
      res.status(503).json({
        success: false,
        message: 'Database is offline. Please try again shortly.',
      });
      return;
    }

    // Check MongoDB
    const user = await (User as any).findOne({ email: emailLower });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials provided',
      });
      return;
    }

    // Compare password via schema instance method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials provided',
      });
      return;
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: `Logged in as ${user.role} successfully`,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    logger.error('Error in user login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: error.message,
    });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User is not authenticated',
      });
      return;
    }

    const { id } = req.user;
    const dbStatus = getDBStatus();

    if (!dbStatus.isConnected) {
      res.status(503).json({
        success: false,
        message: 'Database is offline',
      });
      return;
    }

    const user = await (User as any).findById(id);
    if (user) {
      res.json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          studentId: user.studentId,
          avatarUrl: user.avatarUrl,
        },
      });
      return;
    }

    res.status(404).json({
      success: false,
      message: 'User profile not found',
    });
  } catch (error: any) {
    logger.error('Error in profile fetching:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile',
      error: error.message,
    });
  }
}
