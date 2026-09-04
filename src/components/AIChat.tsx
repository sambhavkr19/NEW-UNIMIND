import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Conversation, ChatMessage } from '../types';
import {
  Send,
  Bot,
  Plus,
  Trash2,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Clock,
  User,
  GraduationCap,
  Check,
  CheckCheck,
  Loader2
} from 'lucide-react';
import Markdown from 'react-markdown';

export default function AIChat() {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasDocuments, setHasDocuments] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if there are documents in the system for RAG status
  useEffect(() => {
    if (!token) return;
    async function checkDocuments() {
      try {
        const response = await fetch('/api/documents', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.documents && data.documents.length > 0) {
          setHasDocuments(true);
        } else {
          setHasDocuments(false);
        }
      } catch (err) {
        console.error('Error checking documents for RAG state:', err);
      }
    }
    checkDocuments();
  }, [token, messages]); // Refresh when a message is added in case documents changed

  // Helper to format timestamps cleanly
  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Suggested prompt templates for university questions
  const SUGGESTIONS = [
    { label: 'Enrollment deadines', text: 'What are the enrollment deadlines for Fall 2026?' },
    { label: 'Register for classes', text: 'How do I register for classes as a Computer Science student?' },
    { label: 'Department locations', text: 'Where are the department offices and registrar located on campus?' },
    { label: 'Submit support ticket', text: 'How can I submit a support ticket for my general inquiries?' }
  ];

  // Fetch all user conversations on mount
  useEffect(() => {
    if (!token) return;

    async function fetchConversations() {
      try {
        setIsHistoryLoading(true);
        setError(null);
        const response = await fetch('/api/chat/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
          setConversations(data.conversations || []);
          // Auto-select the first conversation if available
          if (data.conversations && data.conversations.length > 0) {
            setActiveId(data.conversations[0]._id);
          } else {
            // Auto-create a conversation if none exist
            handleCreateConversation();
          }
        } else {
          setError(data.message || 'Failed to load conversation history');
        }
      } catch (err: any) {
        console.error('Error fetching conversations:', err);
        setError('Network error: Could not reach chat database.');
      } finally {
        setIsHistoryLoading(false);
      }
    }

    fetchConversations();
  }, [token]);

  // Fetch messages when active conversation ID changes
  useEffect(() => {
    if (!token || !activeId) {
      setMessages([]);
      return;
    }

    async function fetchMessages() {
      try {
        setError(null);
        const response = await fetch(`/api/chat/conversations/${activeId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setMessages(data.conversation.messages || []);
        } else {
          setError(data.message || 'Failed to fetch messages');
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Network error: Failed to fetch conversation messages.');
      }
    }

    fetchMessages();
  }, [activeId, token]);

  // Scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Create a new conversation
  const handleCreateConversation = async () => {
    if (!token) return;
    try {
      setError(null);
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: 'New Conversation' })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setConversations(prev => [data.conversation, ...prev]);
        setActiveId(data.conversation._id);
        setMessages([]);
      } else {
        setError(data.message || 'Failed to start a new chat');
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Network error: Failed to create conversation.');
    }
  };

  // Delete a conversation
  const handleDeleteConversation = async (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the deleted item
    if (!token) return;

    if (!window.confirm('Are you sure you want to delete this chat thread? This action is irreversible.')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/chat/conversations/${idToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setConversations(prev => prev.filter(c => c._id !== idToDelete));
        if (activeId === idToDelete) {
          const remaining = conversations.filter(c => c._id !== idToDelete);
          if (remaining.length > 0) {
            setActiveId(remaining[0]._id);
          } else {
            setActiveId(null);
            setMessages([]);
          }
        }
      } else {
        setError(data.message || 'Failed to delete conversation');
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Network error: Failed to delete conversation.');
    }
  };

  // Send a message
  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !token) return;

    let targetActiveId = activeId;

    // Guard: if no active conversation exists, create one first
    if (!targetActiveId) {
      try {
        setIsLoading(true);
        const response = await fetch('/api/chat/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title: 'New Conversation' })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setConversations(prev => [data.conversation, ...prev]);
          targetActiveId = data.conversation._id;
          setActiveId(targetActiveId);
        } else {
          setError(data.message || 'Failed to initialize chat thread');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        setError('Network error: Failed to initialize chat thread.');
        setIsLoading(false);
        return;
      }
    }

    // Append user message instantly for visual responsiveness
    const tempUserMsg: ChatMessage = {
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/conversations/${targetActiveId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: trimmed })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Update local messages with verified DB timestamps
        setMessages(prev => {
          // Remove the temporary visual message and add backend response messages
          const filtered = prev.filter(m => m !== tempUserMsg);
          return [...filtered, data.userMessage, data.modelMessage];
        });
        
        // Update conversation list metadata (specifically title and updatedAt)
        setConversations(prev => prev.map(c => {
          if (c._id === targetActiveId) {
            return {
              ...c,
              title: data.title,
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      } else {
        setError(data.message || 'Failed to get response from helpdesk AI');
        // Clean up temporary visual message on failure
        setMessages(prev => prev.filter(m => m !== tempUserMsg));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Network error: Failed to deliver message to Gemini.');
      // Clean up temporary visual message on exception
      setMessages(prev => prev.filter(m => m !== tempUserMsg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[75vh] md:min-h-[600px] h-[75vh]" id="ai-chat-module">
      
      {/* SIDEBAR: Conversation list */}
      <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0" id="chat-sidebar">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span className="font-display font-bold text-sm text-slate-800">Support Threads</span>
          </div>
          <button
            onClick={handleCreateConversation}
            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 rounded-lg transition-all"
            title="Start new support chat"
            id="btn-new-chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Conversation Items list */}
        <div className="flex-grow overflow-y-auto p-2 space-y-1 max-h-[150px] md:max-h-none" id="conversations-list-container">
          {isHistoryLoading ? (
            <div className="p-4 text-center">
              <span className="text-xs font-mono text-slate-400">Syncing threads...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center">
              <span className="text-xs text-slate-400 block">No support threads yet.</span>
              <button
                onClick={handleCreateConversation}
                className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Create one now
              </button>
            </div>
          ) : (
            conversations.map((convo) => {
              const isActive = convo._id === activeId;
              return (
                <div
                  key={convo._id}
                  onClick={() => setActiveId(convo._id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-between cursor-pointer group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                  id={`convo-item-${convo._id}`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`} />
                    <span className="truncate">{convo.title || 'Support Chat'}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(convo._id, e)}
                    className={`p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-rose-700 hover:text-white transition-all ${
                      isActive ? 'text-indigo-200 hover:bg-indigo-700' : 'text-slate-400'
                    }`}
                    title="Delete Thread"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        {user && (
          <div className="p-3 border-t border-slate-100 bg-white hidden md:flex items-center gap-2">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-7 h-7 rounded-lg object-cover bg-slate-50 border border-slate-100"
            />
            <div className="truncate">
              <span className="block text-[10px] font-bold text-slate-700 truncate">{user.name}</span>
              <span className="block text-[9px] font-mono text-slate-400 truncate uppercase">{user.role} Portal</span>
            </div>
          </div>
        )}
      </div>

      {/* CHAT DISPLAY PANELS */}
      <div className="flex-grow flex flex-col bg-slate-50/50" id="chat-workspace">
        
        {/* Active Chat Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0" id="chat-header">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Bot className="w-4 h-4 text-indigo-600 animate-pulse" />
            </div>
            <div>
              <span className="block font-display font-bold text-sm text-slate-800">UniMind AI Helpdesk</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">Gemini 3.5 Flash Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100/50 text-indigo-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3 text-indigo-500 animate-spin-slow" />
            <span>Persistent History Active</span>
          </div>
        </div>

        {/* Disclaimer informing users that RAG is active or in standby mode */}
        {hasDocuments ? (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 text-emerald-800 text-[11px] font-medium flex items-center gap-2 animate-in fade-in" id="rag-disclaimer-banner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0 fill-emerald-100 animate-pulse" />
            <span><strong>RAG Retrieval Mode Active:</strong> UniMind AI is connected to active university guidelines. Verified guidelines are pulled dynamically to answer queries.</span>
          </div>
        ) : (
          <div className="px-6 py-2.5 bg-amber-50/70 border-b border-amber-100/80 text-amber-800 text-[11px] font-medium flex items-center gap-2" id="rag-disclaimer-banner">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-100 animate-pulse" />
            <span><strong>General Knowledge Mode:</strong> Specific university RAG documents are offline. The assistant is currently using the general Gemini 3.5 Flash knowledge base.</span>
          </div>
        )}

        {/* Error notification banner */}
        {error && (
          <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in" id="chat-error-banner">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <div className="flex-grow">{error}</div>
            <button onClick={() => setError(null)} className="text-xs font-semibold text-rose-600 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Message Thread Scroll area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4" id="chat-messages-container">
          {messages.length === 0 ? (
            /* Welcome Empty State with dynamic helpful hints */
            <div className="h-full flex flex-col justify-center items-center text-center max-w-md mx-auto space-y-6">
              <div className="bg-indigo-50 text-indigo-600 p-4 rounded-3xl relative animate-bounce">
                <Bot className="w-10 h-10" />
                <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 fill-amber-300" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-display font-extrabold text-lg text-slate-900">Virtual Helpdesk Assistant</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  I can answer registration deadlines, department guide lines, exam rules, support details, and help you navigate your student portal.
                </p>
              </div>

              {/* Suggestions grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
                {SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sug.text)}
                    className="p-3 text-left bg-white border border-slate-200 hover:border-indigo-400 rounded-xl text-[11px] text-slate-600 hover:text-indigo-700 transition-all text-xs font-medium shadow-sm hover:shadow-indigo-100"
                    id={`sug-button-${idx}`}
                  >
                    <span className="font-semibold block text-indigo-600 text-[10px] mb-0.5 uppercase tracking-wide">{sug.label}</span>
                    <span className="line-clamp-2">{sug.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Thread Render list */
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const messageTime = formatMessageTime(msg.createdAt || new Date().toISOString());
              const isLastUserLoading = isLoading && isUser && idx === messages.length - 1;

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  id={`chat-msg-${idx}`}
                >
                  {/* Left avatar badge for AI model */}
                  {!isUser && (
                    <div className="bg-indigo-900 text-white p-1.5 rounded-xl shrink-0 mt-0.5 shadow-md shadow-indigo-100">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  {/* Message Bubble box */}
                  <div className="flex flex-col max-w-[85%]">
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}>
                      
                      {/* Render message text with standard/react-markdown renderer */}
                      {isUser ? (
                        <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="text-xs md:text-sm leading-relaxed text-slate-700 max-w-none prose prose-slate 
                          [&_p]:mb-2 [&_p:last-child]:mb-0 
                          [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-3 [&_h1]:mb-1
                          [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-2 [&_h2]:mb-1
                          [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:mt-2 [&_h3]:mb-1
                          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 
                          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
                          [&_li]:mb-1 
                          [&_strong]:font-bold [&_strong]:text-slate-900 
                          [&_code]:font-mono [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-indigo-600 [&_code]:text-xs
                          [&_pre]:bg-slate-900 [&_pre]:text-indigo-200 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:text-indigo-200 [&_pre_code]:p-0
                        ">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      )}
                    </div>

                    {/* Timestamp & Status Metadata */}
                    <div className={`flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-mono ${
                      isUser ? 'justify-end pr-1' : 'justify-start pl-1'
                    }`}>
                      {messageTime && <span>{messageTime}</span>}
                      {isUser ? (
                        isLastUserLoading ? (
                          <span className="flex items-center gap-1 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                            <span>Sending</span>
                            <Loader2 className="w-2.5 h-2.5 text-slate-400 animate-spin" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-indigo-500 font-bold uppercase tracking-wider text-[9px]">
                            <span>Sent</span>
                            <CheckCheck className="w-3 h-3 text-indigo-500" />
                          </span>
                        )
                      ) : (
                        <span className="flex items-center gap-0.5 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                          <span>AI Answer</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right avatar badge for User */}
                  {isUser && (
                    <div className="bg-indigo-100 text-indigo-700 p-1.5 rounded-xl shrink-0 mt-0.5 border border-indigo-200">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Typing/Loading indicator animation */}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start animate-pulse" id="chat-typing-indicator">
              <div className="bg-indigo-900 text-white p-1.5 rounded-xl shrink-0 mt-0.5 shadow-md shadow-indigo-100">
                <Bot className="w-3.5 h-3.5 text-white animate-spin-slow" />
              </div>
              <div className="flex flex-col">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">UniMind AI is thinking...</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-mono pl-1">
                  <span>Drafting answer...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box form container */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0" id="chat-input-area">
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask UniMind AI about classes, deadlines, helpdesk tickets..."
              disabled={isLoading}
              className="flex-grow px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs md:text-sm transition-all text-slate-800 disabled:opacity-50"
              id="chat-input-textbox"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:hover:bg-indigo-600"
              id="chat-send-button"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Send</span>
            </button>
          </form>
          <div className="mt-2 text-center">
            <span className="text-[10px] text-slate-400 font-mono">
              Never share password hashes or personal credit details. AI responses are supportive but non-legally binding.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
