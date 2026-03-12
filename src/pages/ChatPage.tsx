import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, LogOut, UserPlus, AlertTriangle, Paperclip, Mic } from 'lucide-react';
import type { ChatMessage } from '../types';
import styles from './ChatPage.module.css';

interface ChatPageProps {
  messages: ChatMessage[];
  isPartnerTyping: boolean;
  partnerDisconnected: boolean;
  onSendMessage: (text?: string, type?: 'text' | 'image' | 'voice', mediaUrl?: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  onDisconnect: () => void;
  onNewSearch: () => void;
}

export default function ChatPage({
  messages,
  isPartnerTyping,
  partnerDisconnected,
  onSendMessage,
  onTyping,
  onStopTyping,
  onDisconnect,
  onNewSearch,
}: ChatPageProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      onTyping();

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping();
      }, 1500);
    },
    [onTyping, onStopTyping]
  );

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim(), 'text');
    setInputValue('');
    onStopTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, [inputValue, onSendMessage, onStopTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );
  
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой (макс 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      onSendMessage(undefined, 'image', base64Image);
    };

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onSendMessage(undefined, 'voice', base64Audio);
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing mic', err);
      alert('Не удалось получить доступ к микрофону.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>А</div>
          <div>
            <div className={styles.partnerName}>Аноним</div>
            <div className={styles.partnerStatus}>
              {partnerDisconnected ? (
                <span className={styles.offline}>Отключился</span>
              ) : isPartnerTyping ? (
                <span className={styles.typing}>печатает...</span>
              ) : (
                <span className={styles.online}>В сети</span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} onClick={onNewSearch} title="Найти нового собеседника">
            <UserPlus size={18} />
          </button>
          <button className={`${styles.iconBtn} ${styles.disconnectBtn}`} onClick={onDisconnect} title="Отключиться">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className={styles.messages}>
        <div className={styles.notice}>
          <AlertTriangle size={14} />
          Ваше общение полностью анонимно. Не передавайте личные данные.
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.bubble} ${msg.fromPartner ? styles.partner : styles.mine}`}
          >
            {msg.type === 'text' && <p>{msg.text}</p>}
            {msg.type === 'image' && msg.mediaUrl && (
              <img src={msg.mediaUrl} alt="Attached" className={styles.attachedImage} />
            )}
            {msg.type === 'voice' && msg.mediaUrl && (
              <audio controls src={msg.mediaUrl} className={styles.attachedAudio} />
            )}
            <span className={styles.time}>
              {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isPartnerTyping && (
          <div className={`${styles.bubble} ${styles.partner} ${styles.typingBubble}`}>
            <div className={styles.typingDots}>
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {partnerDisconnected && (
          <div className={styles.disconnectedBanner}>
            Собеседник покинул чат.
            <button onClick={onNewSearch}>Найти нового</button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <footer className={styles.inputBar}>
        <button
          className={styles.attachBtn}
          onClick={handleAttachClick}
          disabled={partnerDisconnected}
          aria-label="Прикрепить фото"
          title="Прикрепить фото"
        >
          <Paperclip size={18} />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? 'Идет запись...' : 'Введите сообщение...'}
          className={styles.input}
          disabled={partnerDisconnected || isRecording}
          aria-label="Сообщение"
        />
        {inputValue.trim() ? (
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={partnerDisconnected}
            aria-label="Отправить"
          >
            <Send size={18} />
          </button>
        ) : (
          <button
            className={`${styles.micBtn} ${isRecording ? styles.recording : ''}`}
            onPointerDown={startRecording}
            onPointerUp={stopRecording}
            onPointerLeave={stopRecording}
            disabled={partnerDisconnected}
            aria-label="Записать голосовое"
          >
            <Mic size={18} />
          </button>
        )}
      </footer>
    </div>
  );
}
