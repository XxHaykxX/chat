import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Filters, ChatMessage } from '../types';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isPartnerRecording, setIsPartnerRecording] = useState(false);
  const [partnerDisconnected, setPartnerDisconnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const socket = io(serverUrl);
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('matched', () => {
      setIsMatched(true);
      setPartnerDisconnected(false);
      setMessages([]);
      setIsPartnerTyping(false);
      setIsPartnerRecording(false);
    });

    socket.on('message', (data: { type?: 'text' | 'image' | 'voice' | 'video'; text?: string; mediaUrl?: string; timestamp: number; fromPartner: boolean }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: data.type || 'text',
          text: data.text,
          mediaUrl: data.mediaUrl,
          timestamp: data.timestamp,
          fromPartner: true,
        },
      ]);
    });

    socket.on('typing', () => setIsPartnerTyping(true));
    socket.on('stop-typing', () => setIsPartnerTyping(false));

    socket.on('recording', () => setIsPartnerRecording(true));
    socket.on('stop-recording', () => setIsPartnerRecording(false));

    socket.on('partner-disconnected', () => {
      setPartnerDisconnected(true);
      setIsPartnerTyping(false);
      setIsPartnerRecording(false);
    });

    socket.on('online-count', (data: { count: number }) => {
      setOnlineCount(data.count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const search = useCallback((filters: Filters) => {
    socketRef.current?.emit('search', filters);
  }, []);

  const stopSearch = useCallback(() => {
    socketRef.current?.emit('stop-search');
  }, []);

  const sendMessage = useCallback((text?: string, type: 'text' | 'image' | 'voice' | 'video' = 'text', mediaUrl?: string) => {
    if (type === 'text' && (!text || !text.trim())) return;
    socketRef.current?.emit('message', { type, text, mediaUrl });
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        text,
        mediaUrl,
        timestamp: Date.now(),
        fromPartner: false,
      },
    ]);
  }, []);

  const sendTyping = useCallback(() => {
    socketRef.current?.emit('typing');
  }, []);

  const sendStopTyping = useCallback(() => {
    socketRef.current?.emit('stop-typing');
  }, []);

  const sendRecording = useCallback(() => {
    socketRef.current?.emit('recording');
  }, []);

  const sendStopRecording = useCallback(() => {
    socketRef.current?.emit('stop-recording');
  }, []);

  const disconnectChat = useCallback(() => {
    socketRef.current?.emit('disconnect-chat');
    setIsMatched(false);
    setPartnerDisconnected(false);
    setMessages([]);
    setIsPartnerTyping(false);
    setIsPartnerRecording(false);
  }, []);

  return {
    isConnected,
    isMatched,
    messages,
    setMessages,
    isPartnerTyping,
    isPartnerRecording,
    partnerDisconnected,
    onlineCount,
    search,
    stopSearch,
    sendMessage,
    sendTyping,
    sendStopTyping,
    sendRecording,
    sendStopRecording,
    disconnectChat,
  };
}
