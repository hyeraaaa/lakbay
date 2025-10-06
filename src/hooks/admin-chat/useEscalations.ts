import React from 'react';
import { apiRequest, User } from '@/lib/jwt';

export interface ChatEscalationEvent {
  session_id: number;
  user_id: number;
  escalated_at: string;
  requester_name?: string;
}

export const useEscalations = (user: User | null) => {
  const [escalations, setEscalations] = React.useState<ChatEscalationEvent[]>([]);

  React.useEffect(() => {
    // Fetch existing escalations so reload restores the list
    const fetchEscalations = async () => {
      if (!user || user.user_type !== 'admin') return;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) return;
      try {
        const res = await apiRequest(`${baseUrl}/api/chat-ai/escalations`);
        const data = await res.json();
        if (res.ok && Array.isArray(data?.items)) {
          const items = (data.items as ChatEscalationEvent[]).slice().sort((a, b) => {
            const ta = new Date(a.escalated_at).getTime();
            const tb = new Date(b.escalated_at).getTime();
            return ta - tb; // ascending (oldest first)
          });
          setEscalations(items);
        }
      } catch {}
    };
    fetchEscalations();
  }, [user]);

  const addEscalation = React.useCallback((escalation: ChatEscalationEvent) => {
    setEscalations(prev => {
      const merged = [...prev, escalation];
      merged.sort((a, b) => new Date(a.escalated_at).getTime() - new Date(b.escalated_at).getTime());
      return merged;
    });
  }, []);

  const removeEscalation = React.useCallback((sessionId: number) => {
    setEscalations(prev => prev.filter(e => e.session_id !== sessionId));
  }, []);

  return {
    escalations,
    addEscalation,
    removeEscalation,
  };
};
