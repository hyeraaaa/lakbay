import React from 'react';
import { useJWT } from '@/contexts/JWTContext';
import { useEscalations, ChatEscalationEvent } from './useEscalations';
import { useSocketConnection } from './useSocketConnection';
import { useAISocketConnection } from './useAISocketConnection';
import { useMessages, ChatMessageItem } from './useMessages';

type SessionId = number;

export const useAdminChat = () => {
  const { user } = useJWT();
  const [selectedSessionId, setSelectedSessionId] = React.useState<SessionId | null>(null);
  const [adminInput, setAdminInput] = React.useState('');

  const { escalations, addEscalation, removeEscalation } = useEscalations(user);
  const { socketInstance, connected } = useSocketConnection(user);
  const { aiSocketRef, aiConnected } = useAISocketConnection(user);
  const { messages, isLoadingMessages, messagesContainerRef, messagesEndRef, sendAdminMessage, isUserTyping } = useMessages(
    selectedSessionId,
    aiSocketRef,
    aiConnected
  );
  const typingTimeoutRef = React.useRef<number | null>(null);

  // Listen for session end signals on AI socket: clear selection and remove from escalations
  React.useEffect(() => {
    const currentSocket = aiSocketRef.current;
    if (!currentSocket) return;

    const onSessionEnded = (payload: { sessionId?: number }) => {
      const endedId = payload?.sessionId;
      if (endedId && endedId === selectedSessionId) {
        setSelectedSessionId(null);
      }
      if (endedId) {
        removeEscalation(endedId);
      }
    };

    currentSocket.on('session_ended', onSessionEnded);
    currentSocket.on('admin_session_ended', onSessionEnded);

    return () => {
      currentSocket.off('session_ended', onSessionEnded);
      currentSocket.off('admin_session_ended', onSessionEnded);
    };
  }, [selectedSessionId, removeEscalation, aiSocketRef]);

  // Handle socket events for escalations and admin messages
  React.useEffect(() => {
    if (!socketInstance) return;

    const onNewAdminSubmission = (payload: { type?: string; data?: ChatEscalationEvent }) => {
      if (payload?.type === 'chat_escalation' && payload?.data) {
        addEscalation(payload.data);
      }
    };

    const onAdminMessage = (payload: { session_id?: number; message_id?: number }) => {
      if (payload?.session_id && payload?.message_id && selectedSessionId === payload.session_id) {
        // This is handled by the messages hook, but we need to handle it here for the main socket
        // The AI socket handles the main message flow
      }
    };

    socketInstance.on('new_admin_submission', onNewAdminSubmission);
    socketInstance.on('admin_message', onAdminMessage);

    return () => {
      socketInstance.off('new_admin_submission', onNewAdminSubmission);
      socketInstance.off('admin_message', onAdminMessage);
    };
  }, [socketInstance, selectedSessionId, addEscalation]);

  const handleSendAdminMessage = React.useCallback(() => {
    const text = adminInput.trim();
    if (!text || !selectedSessionId) return;

    // Support "/end" command to end the session from admin side
    if (text === '/end') {
      try {
        if (aiSocketRef.current) {
          // Stop typing before ending session to avoid lingering bubbles
          try { aiSocketRef.current.emit('typing_stop', { sessionId: selectedSessionId }); } catch(_) {}
          aiSocketRef.current.emit('admin_end_session', { sessionId: selectedSessionId });
        }
        // Optimistically clear input and deselect session
        setAdminInput('');
        setSelectedSessionId(null);
        if (selectedSessionId) {
          removeEscalation(selectedSessionId);
        }
      } catch (_) {
        setAdminInput('');
      }
      return;
    }

    sendAdminMessage(text);
    setAdminInput('');
    try {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (aiSocketRef.current && selectedSessionId) {
        aiSocketRef.current.emit('typing_stop', { sessionId: selectedSessionId });
      }
    } catch (_) {}
  }, [adminInput, selectedSessionId, sendAdminMessage, aiSocketRef, setSelectedSessionId, removeEscalation]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendAdminMessage();
    }
  }, [handleSendAdminMessage]);

  const onAdminInputChange = React.useCallback((value: string) => {
    setAdminInput(value);
    try {
      if (!selectedSessionId || !aiSocketRef.current) return;
      aiSocketRef.current.emit('typing_start', { sessionId: selectedSessionId });
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = window.setTimeout(() => {
        try {
          if (aiSocketRef.current) {
            aiSocketRef.current.emit('typing_stop', { sessionId: selectedSessionId });
          }
        } catch (_) {}
      }, 1000);
    } catch (_) {}
  }, [selectedSessionId, aiSocketRef, setAdminInput]);

  return {
    user,
    selectedSessionId,
    setSelectedSessionId,
    adminInput,
    setAdminInput: onAdminInputChange,
    escalations,
    connected,
    messages,
    isLoadingMessages,
    messagesContainerRef,
    messagesEndRef,
    handleSendAdminMessage,
    handleKeyDown,
    isUserTyping,
  };
};
