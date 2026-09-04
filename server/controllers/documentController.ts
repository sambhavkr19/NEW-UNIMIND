import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { Document } from '../models/Document';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

// Ensure uploads folder exists in workspace
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Get all documents (Admin/User view)
 * Omit heavy text field from general listing for efficiency
 */
export async function getDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const documents = await (Document as any).find()
      .select('-text') // Exclude heavy extracted text for listings
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      documents,
    });
  } catch (error: any) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents list',
      error: error.message,
    });
  }
}

/**
 * Upload a PDF file, extract its text content, and store details in MongoDB
 */
export async function uploadDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Role check: Only admins can upload files
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Only university administrative staff can upload documents.',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded. Please supply a valid PDF document.',
      });
      return;
    }

    const file = req.file;

    // Verify it is actually a PDF
    if (file.mimetype !== 'application/pdf') {
      // Clean up uploaded file if it is wrong type
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      res.status(400).json({
        success: false,
        message: 'Invalid file type. Only PDF documents are supported.',
      });
      return;
    }

    logger.info(`Starting PDF text extraction for: ${file.originalname} (${file.size} bytes)`);

    let extractedText = '';
    try {
      const fileBuffer = fs.readFileSync(file.path);
      const parser = new PDFParse({ data: fileBuffer });
      const textResult = await parser.getText();
      extractedText = textResult.text || '';
    } catch (parseError: any) {
      logger.error('Failed to parse PDF text content:', parseError);
      // Write to a local log file for easy inspection/debugging
      try {
        fs.writeFileSync(
          path.join(process.cwd(), 'pdf_parse_error.log'),
          `Error at: ${new Date().toISOString()}\nFile: ${file.originalname}\nMessage: ${parseError.message}\nStack: ${parseError.stack}\n`
        );
      } catch (logErr) {
        // ignore log write errors
      }
      // Clean up uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      res.status(500).json({
        success: false,
        message: 'Failed to extract text from PDF document. The file might be corrupted or image-only.',
        error: parseError.message,
        stack: parseError.stack,
      });
      return;
    }

    // Clean up excessive spacing in extracted text for optimal indexing and LLM context size
    const sanitizedText = extractedText
      .replace(/\s+/g, ' ')
      .trim();

    if (!sanitizedText) {
      logger.warn(`No text could be extracted from: ${file.originalname}`);
    }

    // Create Document record
    const title = file.originalname.replace(/\.[^/.]+$/, ""); // Strip file extension
    const newDoc = new Document({
      title,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      text: sanitizedText || 'Empty PDF text content.',
      userId: req.user.id,
    });

    await newDoc.save();

    logger.info(`Document uploaded and parsed successfully: ${newDoc.title} (ID: ${newDoc._id})`);

    res.status(201).json({
      success: true,
      message: 'PDF document uploaded, indexed, and processed for AI RAG successfully!',
      document: {
        _id: newDoc._id,
        title: newDoc.title,
        filename: newDoc.filename,
        originalName: newDoc.originalName,
        size: newDoc.size,
        createdAt: newDoc.createdAt,
      },
    });
  } catch (error: any) {
    logger.error('Error during uploadDocument:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while uploading the document',
      error: error.message,
    });
  }
}

/**
 * Delete a PDF document and remove its file from disk
 */
export async function deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Role check: Only admins can delete files
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Only university administrative staff can delete documents.',
      });
      return;
    }

    const { id } = req.params;
    const document = await (Document as any).findById(id);

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Document not found in database',
      });
      return;
    }

    // Attempt to delete physical file from disk
    const filePath = path.join(UPLOADS_DIR, document.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logger.info(`Deleted physical file from disk: ${filePath}`);
      } catch (err) {
        logger.error(`Failed to delete physical file at: ${filePath}`, err);
      }
    } else {
      logger.warn(`Physical file not found on disk during deletion: ${filePath}`);
    }

    // Delete database record
    await (Document as any).findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'PDF document and indexed search vectors deleted successfully.',
    });
  } catch (error: any) {
    logger.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the document',
      error: error.message,
    });
  }
}
