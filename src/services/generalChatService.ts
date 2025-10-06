import { apiRequest } from '@/lib/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface GeneralChatUser {
  user_id: number;
  first_name: string;
  last_name: string;
  profile_picture?: string | null;
  user_type: 'customer' | 'owner' | 'admin';
}

export interface GeneralChatMessage {
  message_id: number;
  session_id: number;
  user_id: number;
  sender: 'user' | 'ai' | 'admin';
  message: string;
  attachment_url?: string | null;
  attachment_filename?: string | null;
  created_at: string;
  users?: GeneralChatUser;
}

export interface GeneralChatSessionSummary {
  session_id: number;
  started_at: string;
  ended_at?: string | null;
  other_user: GeneralChatUser;
  last_message: GeneralChatMessage | null;
  message_count: number;
}

export interface GeneralChatSession {
  session_id: number;
  user_id: number;
  peer_user_id: number;
  session_type: 'general';
  started_at: string;
  ended_at?: string | null;
  users: GeneralChatUser;
  peer_user: GeneralChatUser;
  chat_messages?: GeneralChatMessage[];
  ai_message_count?: number;
  user_message_count?: number;
}

export interface MessagesWithPagination {
  messages: GeneralChatMessage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const generalChatService = {
  // GET /api/general-chat/sessions
  getSessions: async (): Promise<{ ok: boolean; data: GeneralChatSessionSummary[]; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/general-chat/sessions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      return { ok: response.ok, data: result.data ?? result, message: result.message };
    } catch (_e) {
      return { ok: false, data: [], message: 'Failed to fetch chat sessions' };
    }
  },

  // GET /api/general-chat/sessions/:sessionId
  getSession: async (sessionId: number): Promise<{ ok: boolean; data: GeneralChatSession; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/general-chat/sessions/${sessionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      return { ok: response.ok, data: result.data ?? result, message: result.message };
    } catch (_e) {
      return { ok: false, data: {} as GeneralChatSession, message: 'Failed to fetch chat session' };
    }
  },

  // DELETE /api/general-chat/sessions/:sessionId
  deleteSession: async (sessionId: number): Promise<{ ok: boolean; data: { message: string } | Record<string, unknown>; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/general-chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      return { ok: response.ok, data: result.data ?? result, message: result.message };
    } catch (_e) {
      return { ok: false, data: { message: 'Failed to delete chat session' } };
    }
  },

  // GET /api/general-chat/sessions/:sessionId/messages
  getMessages: async (
    sessionId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<{ ok: boolean; data: MessagesWithPagination; message?: string }> => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const response = await apiRequest(`${API_BASE_URL}/api/general-chat/sessions/${sessionId}/messages?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      return { ok: response.ok, data: result.data ?? result, message: result.message };
    } catch (_e) {
      return { ok: false, data: { messages: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } }, message: 'Failed to fetch messages' };
    }
  },

  // POST /api/general-chat/messages
  // If sessionId is omitted, ownerId is required and backend will create/get session.
  sendMessage: async (args: {
    message: string;
    sessionId?: number;
    ownerId?: number;
    attachmentUrl?: string | null;
    attachmentFilename?: string | null;
  }): Promise<{ ok: boolean; data: { message: GeneralChatMessage; session: GeneralChatSession; isNewSession: boolean }; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/general-chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      });
      const result = await response.json();
      return { ok: response.ok, data: result.data ?? result, message: result.message || (response.ok ? 'Message sent successfully' : undefined) };
    } catch (_e) {
      return { ok: false, data: {} as { message: GeneralChatMessage; session: GeneralChatSession; isNewSession: boolean }, message: 'Failed to send message' };
    }
  },

  // POST /api/general-chat/sessions/check (customer-only)
  // Get existing session with an owner (does not create new one)
  checkOrGetExistingSessionWithOwner: async (ownerId: number): Promise<{ ok: boolean; data: GeneralChatSession | null; message?: string }> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/general-chat/sessions/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId }),
      });
      const result = await response.json();
      return { ok: response.ok, data: result.data ?? result, message: result.message };
    } catch (_e) {
      return { ok: false, data: null, message: 'Failed to check session' };
    }
  },
};

export default generalChatService;


