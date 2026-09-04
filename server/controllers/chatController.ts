import { Response } from 'express';
import { Conversation } from '../models/Conversation';
import { Document } from '../models/Document';
import { User } from '../models/User';
import { Ticket } from '../models/Ticket';
import { AuthenticatedRequest } from '../middleware/auth';
import { getGeminiClient, generateMockUniMindResponse } from '../utils/gemini';
import { logger } from '../utils/logger';

// System Instruction for Gemini
const SYSTEM_INSTRUCTION = `You are UniMind AI, the intelligent virtual helpdesk assistant for UniMind University. Your job is to assist students and staff with university-related inquiries, course registration, administrative procedures, campus life, schedules, academic deadlines, and general questions.
- Maintain a helpful, welcoming, supportive, and professional tone.
- Format your responses cleanly using Markdown, including bolding, lists, code snippets, tables, and headers where appropriate.
- **CRITICAL**: When answering, prioritize being **extremely specific, precise, comprehensive, and detailed**. Quote specific numbers, exact dates/deadlines, class codes, names, sections, and criteria exactly as they appear in the provided context or guidelines.
- **DO NOT** use vague summaries, generalizations, or generic answers. If specific information is present in the provided document context or the user's message, you MUST extract and deliver those exact details to the user.
- Since you are an intelligent university helpdesk, feel free to guide students to create support tickets if they need formal registrar actions.`;

/**
 * Categorize a question's department/priority and construct a clean title
 */
function determineTicketMetadata(question: string): { department: string; priority: string; title: string } {
  const query = question.toLowerCase();
  
  let department = 'general';
  if (query.includes('fee') || query.includes('pay') || query.includes('scholarship') || query.includes('tuition') || query.includes('refund') || query.includes('cost') || query.includes('billing')) {
    department = 'finance';
  } else if (query.includes('exam') || query.includes('grade') || query.includes('gpa') || query.includes('test') || query.includes('quiz') || query.includes('result') || query.includes('transcript') || query.includes('score')) {
    department = 'examination';
  } else if (query.includes('hostel') || query.includes('room') || query.includes('dorm') || query.includes('accommodation') || query.includes('housing') || query.includes('residence')) {
    department = 'hostel';
  } else if (query.includes('course') || query.includes('register') || query.includes('class') || query.includes('major') || query.includes('advisor') || query.includes('curriculum') || query.includes('syllabus') || query.includes('degree')) {
    department = 'academic';
  }

  let priority = 'medium';
  if (query.includes('urgent') || query.includes('emergency') || query.includes('immediate') || query.includes('deadline') || query.includes('fail') || query.includes('lost') || query.includes('asap')) {
    priority = 'high';
  } else if (query.includes('critical') || query.includes('blocker') || query.includes('prevent')) {
    priority = 'urgent';
  } else if (query.includes('minor') || query.includes('future') || query.includes('by the way') || query.includes('just wondering')) {
    priority = 'low';
  }

  // Create a clean title (first 5 words)
  const words = question.split(/\s+/).slice(0, 5).join(' ');
  const title = words.length > 40 ? `${words.substring(0, 37)}...` : words;

  return { department, priority, title: title || 'Inquiry Ticket' };
}

/**
 * Perform a high-relevance keyword and phrase search over uploaded PDF document texts
 * to extract relevant excerpts for real-time Retrieval-Augmented Generation (RAG).
 * Supports full-text passing for maximum fidelity and specificity.
 */
async function findRelevantContext(queryText: string): Promise<string> {
  try {
    const trimmedQuery = queryText.trim().toLowerCase();
    if (!trimmedQuery) return '';

    // Retrieve all documents
    const docs = await (Document as any).find({});
    if (!docs || docs.length === 0) return '';

    let matches: Array<{ title: string; matchedContent: string; score: number }> = [];

    // Filter search words
    const words = trimmedQuery.split(/\s+/).filter(w => w.length > 3);

    for (const doc of docs) {
      const docText = (doc.text || '');
      const docTextLower = docText.toLowerCase();
      const docTitleLower = (doc.title || '').toLowerCase();
      
      let score = 0;
      let matchedWordCount = 0;
      
      // Exact match on the query yields high score
      if (docTextLower.includes(trimmedQuery)) {
        score += 500;
      }
      
      // Score individual word hits
      for (const word of words) {
        if (docTextLower.includes(word)) {
          score += 50;
          matchedWordCount++;
        }
        if (docTitleLower.includes(word)) {
          score += 100; // Title match has higher significance
        }
      }

      if (score > 0 || words.length === 0) {
        // If the document is small or medium (under 150k characters, which is ~25k words),
        // we feed the ENTIRE document text to the LLM to guarantee perfect accuracy and context coverage!
        if (docText.length <= 150000) {
          matches.push({
            title: doc.title,
            matchedContent: docText,
            score: score + (matchedWordCount * 10) // Boost score based on unique word matches
          });
        } else {
          // If the document is huge, we extract multiple large 12,000 character windows
          // around where the highest density of query terms are found.
          const indices: number[] = [];
          for (const word of words) {
            let idx = docTextLower.indexOf(word);
            while (idx !== -1 && indices.length < 10) {
              indices.push(idx);
              idx = docTextLower.indexOf(word, idx + word.length + 500); // look for next occurrence far enough away
            }
          }
          
          // If no word indices found, use exact query match or start from beginning
          if (indices.length === 0) {
            const phraseOccur = docTextLower.indexOf(trimmedQuery);
            if (phraseOccur !== -1) {
              indices.push(phraseOccur);
            } else {
              indices.push(0);
            }
          }
          
          // Sort indices
          indices.sort((a, b) => a - b);
          
          // Merge close indices to prevent overlapping chunks
          const mergedWindows: Array<{ start: number; end: number }> = [];
          const windowSize = 12000;
          
          for (const index of indices) {
            const start = Math.max(0, index - 2000);
            const end = Math.min(docText.length, start + windowSize);
            
            if (mergedWindows.length === 0) {
              mergedWindows.push({ start, end });
            } else {
              const last = mergedWindows[mergedWindows.length - 1];
              if (start < last.end) {
                // Overlap, merge them
                last.end = Math.max(last.end, end);
              } else {
                mergedWindows.push({ start, end });
              }
            }
          }
          
          // Extract text from merged windows
          const extractedChunks = mergedWindows.slice(0, 4).map(w => {
            return `... [Excerpt from index ${w.start} to ${w.end}]:\n${docText.substring(w.start, w.end).trim()} ...`;
          });
          
          matches.push({
            title: doc.title,
            matchedContent: extractedChunks.join('\n\n---\n\n'),
            score: score
          });
        }
      }
    }

    // Sort matching pages by relevancy score
    matches.sort((a, b) => b.score - a.score);

    // Limit to top 3 highly relevant matching documents to keep prompt clean but extremely detailed
    const topMatches = matches.slice(0, 3);
    if (topMatches.length === 0) return '';

    return topMatches
      .map(m => `=========================================\nDOCUMENT SOURCE: "${m.title}"\n=========================================\n${m.matchedContent}`)
      .join('\n\n');
  } catch (err) {
    logger.error('Error finding relevant RAG context:', err);
    return '';
  }
}

/**
 * Get all conversations for the authenticated user
 */
export async function getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;
    const conversations = await (Conversation as any).find({ userId })
      .select('title messages createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      conversations,
    });
  } catch (error: any) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message,
    });
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { title } = req.body;
    const userId = req.user.id;

    const newConversation = new Conversation({
      userId,
      title: title || 'New Conversation',
      messages: [],
    });

    await newConversation.save();

    res.status(201).json({
      success: true,
      conversation: newConversation,
    });
  } catch (error: any) {
    logger.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation',
      error: error.message,
    });
  }
}

/**
 * Get a specific conversation by ID
 */
export async function getConversationById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await (Conversation as any).findOne({ _id: id, userId });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied',
      });
      return;
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error: any) {
    logger.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation',
      error: error.message,
    });
  }
}

/**
 * Delete a specific conversation
 */
export async function deleteConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await (Conversation as any).findOneAndDelete({ _id: id, userId });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation',
      error: error.message,
    });
  }
}

/**
 * Send a message in a conversation and get Gemini AI response
 */
export async function sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
      return;
    }

    const conversation = await (Conversation as any).findOne({ _id: id, userId });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied',
      });
      return;
    }

    // 1. Add user message to conversation history
    const userMsg = {
      role: 'user',
      content: content.trim(),
    };
    conversation.messages.push(userMsg);

    // If the conversation title was default and this is the first user message, update title dynamically
    if (conversation.title === 'New Conversation' && conversation.messages.length <= 2) {
      const slicedContent = content.trim();
      conversation.title = slicedContent.length > 35 ? `${slicedContent.substring(0, 32)}...` : slicedContent;
    }

    // Check if there are any uploaded university documents in the database
    const totalDocsCount = await (Document as any).countDocuments({});
    const hasDocuments = totalDocsCount > 0;

    // Retrieve PDF document context relevant to the query (RAG)
    const context = await findRelevantContext(content.trim());
    const isRagActive = !!context;

    // 2. Prepare chat history for Gemini API
    // We map Mongoose subdocuments to the format expected by Gemini contents.
    const contentsPayload = conversation.messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // If there are documents in the system, we enforce strict Retrieval-Augmented Generation (RAG)
    if (hasDocuments && contentsPayload.length > 0) {
      const lastPayloadItem = contentsPayload[contentsPayload.length - 1];
      if (lastPayloadItem.role === 'user') {
        lastPayloadItem.parts[0].text = `You are a strict Retrieval-Augmented Generation (RAG) assistant for UniMind University. You MUST answer the student's question ONLY using the retrieved official university documents provided below.

RULES:
1. Answer the student's question ONLY based on the facts and information explicitly mentioned in the retrieved university documents below.
2. If the user has pasted a document's content or PDF text directly into their message, prioritize and treat that pasted content as an authoritative retrieved document, and answer specifically, precisely, and comprehensively based on it.
3. If the requested information cannot be found in the provided retrieved university documents or the user's pasted text, you MUST state clearly and verbatim: "I am sorry, but that information is not available in the uploaded university documents." Do NOT try to guess, make up information, extrapolate, or answer from general/outside knowledge.
4. Be extremely specific, precise, comprehensive, and detailed. Quote exact dates, deadlines, names, figures, codes, and rules exactly as they appear. Do not use vague summaries or generalizations.
5. If the user's message is a simple, non-factual greeting (e.g. "hi", "hello"), you may reply with a brief, friendly greeting and ask them how you can help them with the university documents.

RETRIEVED OFFICIAL UNIVERSITY DOCUMENTS:
${context || 'No matching document chunks found in the university database.'}

STUDENT QUESTION:
${content.trim()}`;
      }
    }

    let aiResponseText = '';

    // 3. Call Gemini API
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getGeminiClient();
        logger.info(`Sending chat thread to Gemini model 'gemini-3.5-flash'. Length: ${contentsPayload.length}. RAG Active: ${isRagActive}`);
        
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: contentsPayload,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });

          aiResponseText = response.text || '';
        } catch (primaryError: any) {
          logger.info('Primary AI model is busy, switching seamlessly to fallback model gemini-3.1-flash-lite.');
          
          const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: contentsPayload,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });
          
          aiResponseText = response.text || '';
        }

        if (!aiResponseText.trim()) {
          aiResponseText = "I apologize, I didn't receive a clear response. Let me know how else I can help you.";
        }
      } catch (geminiError: any) {
        logger.error('Both Gemini models failed, falling back to mock helpdesk generator:', geminiError);
        aiResponseText = generateMockUniMindResponse(content, conversation.messages);
        if (isRagActive) {
          aiResponseText = `### RAG Direct Document Insights 📖\n*Matched official university guidelines:*\n\n${context}\n\n---\n\n${aiResponseText}`;
        }
      }
    } else {
      logger.warn('No GEMINI_API_KEY found, using fallback local responses.');
      aiResponseText = generateMockUniMindResponse(content, conversation.messages);
      if (isRagActive) {
        aiResponseText = `### RAG Direct Document Insights 📖\n*Matched official university guidelines:*\n\n${context}\n\n---\n\n${aiResponseText}`;
      }
    }

    // Check if the AI could not confidently answer (e.g., if the information is unavailable in the uploaded university documents)
    const lowerResponse = aiResponseText.toLowerCase();
    const cannotAnswer = 
      lowerResponse.includes("is not available in the uploaded university documents") ||
      lowerResponse.includes("not available in the uploaded university documents") ||
      lowerResponse.includes("not available in the retrieved university documents") ||
      lowerResponse.includes("information is not available");

    if (cannotAnswer && req.user) {
      try {
        const student = await (User as any).findById(req.user.id);
        if (student) {
          const meta = determineTicketMetadata(content);
          
          const newTicket = await (Ticket as any).create({
            studentId: student._id,
            studentName: student.name,
            studentEmail: student.email,
            title: meta.title,
            question: content,
            department: meta.department,
            priority: meta.priority,
            status: 'open',
          });

          const ticketId = newTicket._id.toString();
          logger.info(`Automatically created Support Ticket: ${ticketId} for student ${student.name}`);

          aiResponseText += `\n\n***\n\n### 🎫 Support Ticket Automatically Logged\nBecause I couldn't find this information in the official documents, I have automatically created a support ticket for you so our university administration team can review and respond directly!\n\n- **Ticket ID**: \`${ticketId}\`\n- **Department**: \`${meta.department.toUpperCase()}\`\n- **Priority**: \`${meta.priority.toUpperCase()}\`\n- **Status**: \`OPEN (Awaiting response)\`\n\nYou can track and view all your tickets under the **Support Tickets** tab!`;
        }
      } catch (ticketErr) {
        logger.error('Error auto-creating support ticket:', ticketErr);
      }
    }

    // 4. Add AI response to conversation
    const modelMsg = {
      role: 'model',
      content: aiResponseText,
    };
    conversation.messages.push(modelMsg);

    // 5. Save everything in MongoDB
    await conversation.save();

    res.json({
      success: true,
      userMessage: conversation.messages[conversation.messages.length - 2],
      modelMessage: conversation.messages[conversation.messages.length - 1],
      conversationId: conversation._id,
      title: conversation.title,
      isRagActive,
    });
  } catch (error: any) {
    logger.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message,
    });
  }
}
