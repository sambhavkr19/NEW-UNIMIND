import { GoogleGenAI } from '@google/genai';
import { logger } from './logger';

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY is not defined in the environment. AI responses will use a highly detailed fallback mock generator.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || 'MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

/**
 * Robust mock response generator to handle cases where GEMINI_API_KEY is missing or invalid,
 * preventing any crash and ensuring full application functionality.
 */
export function generateMockUniMindResponse(prompt: string, history: Array<{ role: string; content: string }>): string {
  const lowercasePrompt = prompt.toLowerCase();
  
  if (lowercasePrompt.includes('hello') || lowercasePrompt.includes('hi') || lowercasePrompt.includes('hey')) {
    return `### Welcome to UniMind! 👋

Hello! I am **UniMind AI**, your virtual student assistant. I can help you with:
- 📅 **Course Registration** & Class Schedules
- 🏫 **Department Guides** & Office Locations
- 📝 **Enrollment Procedures** & Registrar Forms
- 💬 **General Campus Queries**

How can I assist you today? Please feel free to ask any university-related questions!`;
  }

  if (lowercasePrompt.includes('course') || lowercasePrompt.includes('class') || lowercasePrompt.includes('register')) {
    return `### Course Registration Guide 📚

Registration for the **Fall 2026** semester is currently open! Here are the steps to register:
1. **Academic Advising**: Meet with your department advisor to verify your course plan.
2. **Student Portal**: Navigate to the **Courses** page in your UniMind Dashboard.
3. **Add Classes**: Search by course code (e.g., \`CS101\`, \`MATH201\`) and click **Enroll**.

**Important Deadlines:**
- **Registration Ends**: August 15, 2026
- **Add/Drop Deadline**: September 5, 2026

*Need more specific help? Let me know your major department!*`;
  }

  if (lowercasePrompt.includes('department') || lowercasePrompt.includes('computer science') || lowercasePrompt.includes('office')) {
    return `### UniMind Departments & Contact Offices 🏢

Here is a quick directory of key university offices:
- 💻 **Computer Science Department**: Tech Wing, Block C, Room 402. Contact: \`cs@unimind.edu\`
- 📄 **Registrar Office**: Administration Block, Ground Floor. Contact: \`registrar@unimind.edu\`
- 💳 **Student Accounts & Finance**: Administration Block, Room 105. Contact: \`billing@unimind.edu\`
- 🩺 **Student Health Center**: Campus Commons, Block B. Contact: \`health@unimind.edu\`

*You can submit an official request ticket through your Portal for immediate assistance from these departments!*`;
  }

  if (lowercasePrompt.includes('ticket') || lowercasePrompt.includes('help') || lowercasePrompt.includes('support')) {
    return `### UniMind Ticketing & Helpdesk Support 🎫

If you are experiencing a complex issue, you can create a formal support ticket:
1. Go to your **Helpdesk/Portal** page.
2. Click on **Create Ticket**.
3. Select the appropriate department (e.g., Registrar, IT Support, Finance).
4. Provide a description of your issue and click **Submit**.

Our administrative staff typically responds to all tickets within **24-48 business hours**. You will receive real-time notifications here as soon as they update your ticket!`;
  }

  // General responsive fallback
  return `### UniMind AI Assistant 🧠

Thank you for your question! As your virtual student assistant, I'm here to support your academic journey. 

Regarding your question: *"${prompt}"*

1. **Self-Service**: Check the official Student Handbook or visit your Portal's course section.
2. **Helpdesk Tickets**: If this is an administrative or technical issue, you can log a ticket for a human registrar agent to resolve.
3. **Advising**: We highly recommend consulting with a departmental advisor for course requirements.

*How else can I help you with your UniMind portal or classes today?*`;
}
