/**
 * Core type declarations for UniMind AI.
 * Defined early to promote modularity and clean TypeScript usage.
 */

export type UserRole = 'student' | 'college_admin' | 'platform_admin' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  studentId?: string;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  department: string;
  priority: 'info' | 'important' | 'urgent';
  authorName: string;
  createdAt: string;
}

export interface College {
  _id: string;
  name: string;
  code: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  studentCount: number;
  adminCount: number;
  createdAt: string;
}

export interface SystemLogItem {
  _id: string;
  level: 'info' | 'warn' | 'error';
  component: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  category: 'academic' | 'hostel' | 'examination' | 'finance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ChatMessage {
  _id?: string;
  role: 'user' | 'model';
  content: string;
  createdAt?: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

