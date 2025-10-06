import React from 'react';
import { Socket } from 'socket.io-client';

export interface ChatMessageItem {
  message_id: number;
  session_id: number;
  user_id?: number | null;
  sender: 'user' | 'ai' | 'admin';
  message: string;
  created_at: string;
}

type SessionId = number;

interface MessageHistoryPayload {
  session_id: number;
  messages: ChatMessageItem[];
}


interface NewMessagePayload {
  message_id: number;
  session_id: number;
  user_id?: number;
  sender: 'user' | 'ai' | 'admin';
  message: string;
  created_at?: string;
}

interface AdminJoinedPayload {
  sessionId: number;
}

interface UserTypingPayload {
  sessionId: number;
  isTyping: boolean;
}

export const useMessages = (selectedSessionId: SessionId | null, aiSocketRef: React.RefObject<Socket | null>, aiConnected: boolean) => {
  const [messages, setMessages] = React.useState<ChatMessageItem[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false);
  const [isUserTyping, setIsUserTyping] = React.useState(false);
  const lastMessageIdRef = React.useRef<number | null>(null);
  const selectedSessionIdRef = React.useRef<SessionId | null>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    selectedSessionIdRef.current = selectedSessionId;
  }, [selectedSessionId]);

  // Join/leave selected session room as admin
  React.useEffect(() => {
    const currentSocket = aiSocketRef.current;
    if (!currentSocket || !aiConnected) return;

    if (selectedSessionId != null) {
      currentSocket.emit('admin_join_session', { sessionId: selectedSessionId });
    }

    return () => {
      if (selectedSessionId != null && currentSocket) {
        currentSocket.emit('admin_leave_session', { sessionId: selectedSessionId });
      }
    };
  }, [selectedSessionId, aiConnected, aiSocketRef]);

  // Load messages via socket when selecting a session
  React.useEffect(() => {
    if (!selectedSessionId || !aiSocketRef.current) return;
    setIsLoadingMessages(true);
    setMessages([]);
    lastMessageIdRef.current = null;
    // Joining will trigger admin_joined_session -> history request
    // As a fallback, also request history directly if already joined
    aiSocketRef.current.emit('admin_request_history', { sessionId: selectedSessionId });
  }, [selectedSessionId, aiSocketRef]);

  // Handle message history and typing indicators from socket
  React.useEffect(() => {
    const currentSocket = aiSocketRef.current;
    if (!currentSocket) return;

    const onMessageHistory = (payload: MessageHistoryPayload) => {
      if (!selectedSessionId) return;
      if (payload?.session_id !== selectedSessionId || !Array.isArray(payload?.messages)) return;

      const incoming = payload.messages;
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.message_id));
        const merged = [...prev, ...incoming.filter(m => !existingIds.has(m.message_id))];
        return merged;
      });
      if (incoming.length) {
        lastMessageIdRef.current = incoming[incoming.length - 1].message_id;
      }
      setIsLoadingMessages(false);
    };

    const onNewMessage = (payload: NewMessagePayload) => {
      const currentSessionId = selectedSessionIdRef.current;
      if (!currentSessionId) return;
      if (payload?.session_id === currentSessionId) {
        // Any incoming user message should hide the typing bubble immediately
        if (payload?.sender === 'user') {
          setIsUserTyping(false);
        }
        setMessages(prev => [...prev, {
          message_id: payload.message_id,
          session_id: payload.session_id,
          user_id: payload.user_id ?? null,
          sender: payload.sender,
          message: payload.message,
          created_at: payload.created_at || new Date().toISOString(),
        }]);
        lastMessageIdRef.current = payload.message_id;
      }
    };

    const onAdminMessage = (payload: NewMessagePayload) => {
      const currentSessionId = selectedSessionIdRef.current;
      if (!currentSessionId) return;
      if (payload?.session_id === currentSessionId) {
        setMessages(prev => [...prev, {
          message_id: payload.message_id,
          session_id: payload.session_id,
          user_id: null,
          sender: 'admin',
          message: payload.message,
          created_at: payload.created_at || new Date().toISOString(),
        }]);
        lastMessageIdRef.current = payload.message_id;
      }
    };

    const onAdminJoined = (payload: AdminJoinedPayload) => {
      const currentSessionId = selectedSessionIdRef.current;
      if (!currentSessionId) return;
      if (payload?.sessionId === currentSessionId) {
        // After join confirmed, request history to avoid race
        currentSocket.emit('admin_request_history', { sessionId: currentSessionId, sinceMessageId: lastMessageIdRef.current ?? undefined });
      }
    };

    const onUserTyping = (payload: UserTypingPayload) => {
      const currentSessionId = selectedSessionIdRef.current;
      if (!currentSessionId) return;
      if (payload?.sessionId === currentSessionId) {
        setIsUserTyping(Boolean(payload.isTyping));
      }
    };

    currentSocket.on('message_history', onMessageHistory);
    currentSocket.on('new_message', onNewMessage);
    currentSocket.on('admin_message', onAdminMessage);
    currentSocket.on('admin_joined_session', onAdminJoined);
    currentSocket.on('user_typing', onUserTyping);

    return () => {
      currentSocket.off('message_history', onMessageHistory);
      currentSocket.off('new_message', onNewMessage);
      currentSocket.off('admin_message', onAdminMessage);
      currentSocket.off('admin_joined_session', onAdminJoined);
      currentSocket.off('user_typing', onUserTyping);
    };
  }, [selectedSessionId, aiSocketRef]);

  // Auto-scroll to bottom on new messages, typing, or when loading completes
  React.useEffect(() => {
    // Use container scroll for pixel-perfect bottom alignment
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // Defer to next frame to ensure DOM has painted
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
      return;
    }
    // Fallback to end-ref scrolling if container ref isn't attached
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoadingMessages, selectedSessionId, isUserTyping]);

  const sendAdminMessage = React.useCallback((message: string) => {
    if (!selectedSessionId || !aiSocketRef.current) return;
    aiSocketRef.current.emit('admin_send_message', { sessionId: selectedSessionId, message });
  }, [selectedSessionId, aiSocketRef]);

  return {
    messages,
    isLoadingMessages,
    messagesContainerRef,
    messagesEndRef,
    sendAdminMessage,
    isUserTyping,
  };
};