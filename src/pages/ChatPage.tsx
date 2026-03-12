import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, LogOut, UserPlus, AlertTriangle } from 'lucide-react';
import type { ChatMessage } from '../types';
import styles from './ChatPage.module.css';

interface ChatPageProps {
  messages: ChatMessage[];
  isPartnerTyping: boolean;
  partnerDisconnected: boolean;
  onSendMessage: (text: string) => void;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
    onSendMessage(inputValue.trim());
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
            <p>{msg.text}</p>
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
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение..."
          className={styles.input}
          disabled={partnerDisconnected}
          aria-label="Сообщение"
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!inputValue.trim() || partnerDisconnected}
          aria-label="Отправить"
        >
          <Send size={18} />
        </button>
      </footer>
    </div>
  );
}
