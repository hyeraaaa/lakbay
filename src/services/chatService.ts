import { apiRequest } from '@/lib/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ChatMessage {
  message_id: number;
  session_id: number;
  user_id?: number;
  sender: 'user' | 'ai' | 'admin';
  message: string;
  created_at: string;
}

export interface ChatSession {
  session_id: number;
  user_id: number;
  booking_id?: number;
  started_at: string;
  ended_at?: string;
  escalated_at?: string;
  escalated_to?: number;
  session_type: 'support' | 'booking';
  status: 'ai_handling' | 'admin_handling' | 'ended';
  ai_message_count: number;
  user_message_count: number;
}

export interface ChatSessionResponse {
  session: ChatSession;
  welcomeMessage?: ChatMessage;
  message: string;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  aiResponse?: ChatMessage;
}

export interface ChatSessionMessagesResponse {
  messages: ChatMessage[];
  session: {
    session_id: number;
    status: ChatSession['status'];
    session_type: ChatSession['session_type'];
    user_message_count: number;
    ai_message_count: number;
    escalated_at?: string | null;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EscalateResponse {
  message: string;
  escalated_at: string;
  escalated_to: number;
  session_id: number;
}

export interface EndSessionResponse {
  message: string;
  session_id: number;
  ended_at: string;
}

export interface AIUsageResponse {
  total_sessions: number;
  total_messages: number;
  ai_message_count: number;
  user_message_count: number;
  escalation_count: number;
  average_session_duration: number;
  period: {
    start_date: string;
    end_date: string;
  };
}

export const chatService = {
  // Create a new chat session with AI welcome message
  createChatSession: async (): Promise<{ ok: boolean; data: ChatSessionResponse; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/chat-ai/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      return {
        ok: response.ok,
        data: result,
        message: result.message || (response.ok ? undefined : 'Failed to create chat session')
      };
    } catch (error) {
      return {
        ok: false,
        data: {} as ChatSessionResponse,
        message: 'Failed to create chat session'
      };
    }
  },

  // Get or create chat session
  getOrCreateChatSession: async (): Promise<{ ok: boolean; data: ChatSessionResponse; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/chat-ai/sessions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      return {
        ok: response.ok,
        data: result,
        message: result.message || (response.ok ? undefined : 'Failed to get chat session')
      };
    } catch (error) {
      return {
        ok: false,
        data: {} as ChatSessionResponse,
        message: 'Failed to get chat session'
      };
    }
  },

  // Get session with messages
  getSessionWithMessages: async (sessionId: number): Promise<{ ok: boolean; data: ChatSessionMessagesResponse; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/chat-ai/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      return {
        ok: response.ok,
        data: result,
        message: result.message || (response.ok ? undefined : 'Failed to get session messages')
      };
    } catch (error) {
      return {
        ok: false,
        data: {} as ChatSessionMessagesResponse,
        message: 'Failed to get session messages'
      };
    }
  },

  // Send a message
  sendMessage: async (sessionId: number, message: string): Promise<{ ok: boolean; data: SendMessageResponse; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/chat-ai/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      const result = await response.json();
      return {
        ok: response.ok,
        data: result,
        message: result.message || (response.ok ? undefined : 'Failed to send message')
      };
    } catch (error) {
      return {
        ok: false,
        data: {} as SendMessageResponse,
        message: 'Failed to send message'
      };
    }
  },

  // Escalate to admin
  escalateToAdmin: async (sessionId: number): Promise<{ ok: boolean; data: EscalateResponse; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/chat-ai/sessions/${sessionId}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      return {
        ok: response.ok,
        data: result,
        message: result.message || (response.ok ? undefined : 'Failed to escalate to admin')
      };
    } catch (error) {
      return {
        ok: false,
        data: {} as EscalateResponse,
        message: 'Failed to escalate to admin'
      };
    }
  },

  // End session
  endSession: async (sessionId: number): Promise<{ ok: boolean; data: EndSessionResponse; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/chat-ai/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      return {
        ok: response.ok,
        data: result,
        message: result.message || (response.ok ? undefined : 'Failed to end session')
      };
    } catch (error) {
      return {
        ok: false,
        data: {} as EndSessionResponse,
        message: 'Failed to end session'
      };
    }
  },

  // Get AI usage statistics
  getAIUsage: async (): Promise<{ ok: boolean; data: AIUsageResponse; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/chat-ai/ai-usage`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      return {
        ok: response.ok,
        data: result,
        message: result.message || (response.ok ? undefined : 'Failed to get AI usage')
      };
    } catch (error) {
      return {
        ok: false,
        data: {} as AIUsageResponse,
        message: 'Failed to get AI usage'
      };
    }
  }
};

