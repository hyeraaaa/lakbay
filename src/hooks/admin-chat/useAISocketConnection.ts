import React from 'react';
import { io, Socket } from 'socket.io-client';
import { User } from '@/lib/jwt';

export const useAISocketConnection = (user: User | null) => {
  const [aiConnected, setAiConnected] = React.useState(false);
  const aiSocketRef = React.useRef<Socket | null>(null);

  React.useEffect(() => {
    if (!user || user.user_type !== 'admin') return;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : undefined;
    const aiSocket = io(`${baseUrl}/ai-chat`, {
      transports: ['websocket'],
      auth: { token },
    });

    const onConnect = () => setAiConnected(true);
    const onDisconnect = () => setAiConnected(false);

    aiSocket.on('connect', onConnect);
    aiSocket.on('disconnect', onDisconnect);

    aiSocketRef.current = aiSocket;

    return () => {
      aiSocket.off('connect', onConnect);
      aiSocket.off('disconnect', onDisconnect);
      aiSocket.close();
      aiSocketRef.current = null;
    };
  }, [user]);

  return {
    aiSocketRef,
    aiConnected,
  };
};
