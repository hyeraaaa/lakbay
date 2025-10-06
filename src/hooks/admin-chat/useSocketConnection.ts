import React from 'react';
import { io, Socket } from 'socket.io-client';
import { User } from '@/lib/jwt';

export const useSocketConnection = (user: User | null) => {
  const [socketInstance, setSocketInstance] = React.useState<Socket | null>(null);
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    // Only connect if we have an admin user
    if (!user || user.user_type !== 'admin') return;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) return;

    const socket = io(baseUrl, {
      transports: ['websocket'],
      auth: {
        token: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : undefined,
      },
    });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    setSocketInstance(socket);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.close();
      setSocketInstance(null);
    };
  }, [user]);

  return {
    socketInstance,
    connected,
  };
};
