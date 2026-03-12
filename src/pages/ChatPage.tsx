import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, LogOut, UserPlus, AlertTriangle, Paperclip, Mic, Play, Pause, Copy, Trash2 } from 'lucide-react';
import type { ChatMessage } from '../types';
import styles from './ChatPage.module.css';

const AUDIO_PLAY_EVENT = 'custom-audio-play';

// --- Custom Audio Player Component ---
const VoiceMessagePlayer: React.FC<{ url: string; msgId: string }> = ({ url, msgId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleOtherPlay = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== msgId && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener(AUDIO_PLAY_EVENT, handleOtherPlay);
    
    return () => {
      window.removeEventListener(AUDIO_PLAY_EVENT, handleOtherPlay);
    };
  }, [msgId]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
      window.dispatchEvent(new CustomEvent(AUDIO_PLAY_EVENT, { detail: msgId }));
    }
  };

  return (
    <div className={styles.voicePlayer}>
      <audio 
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        preload="metadata"
        style={{ display: 'none' }}
      />
      <button onClick={togglePlay} className={styles.playButton} type="button">
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <div className={styles.voiceWaveform}>
        <div className={styles.waveBar} />
        <div className={styles.waveBar} />
        <div className={styles.waveBar} />
        <span className={styles.voiceText}>Голосовое сообщение</span>
      </div>
    </div>
  );
};
// -------------------------------------

interface ChatPageProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isPartnerTyping: boolean;
  isPartnerRecording: boolean;
  partnerDisconnected: boolean;
  onSendMessage: (text?: string, type?: 'text' | 'image' | 'voice' | 'video', mediaUrl?: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  onDisconnect: () => void;
  onNewSearch: () => void;
}

export default function ChatPage({
  messages,
  setMessages,
  isPartnerTyping,
  isPartnerRecording,
  partnerDisconnected,
  onSendMessage,
  onTyping,
  onStopTyping,
  onDisconnect,
  onNewSearch,
}: ChatPageProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; messageId: string | null; textItem: string | null }>({ visible: false, x: 0, y: 0, messageId: null, textItem: null });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);
  
  useEffect(() => {
    if (isRecording) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping, isPartnerRecording]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.visible) setContextMenu((prev) => ({ ...prev, visible: false }));
    };
    const handleGlobalScroll = () => {
      if (contextMenu.visible) setContextMenu((prev) => ({ ...prev, visible: false }));
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('scroll', handleGlobalScroll, true);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('scroll', handleGlobalScroll, true);
    };
  }, [contextMenu.visible]);

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

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      onSendMessage(undefined, isVideo ? 'video' : 'image', base64Data);
    };

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    if (isRecordingRef.current || partnerDisconnected) return;
    try {
      isRecordingRef.current = true;
      setIsRecording(true);
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
        // Use the actual mimeType recorded by the browser (crucial for iOS Safari which might use mp4)
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
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
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const openContextMenu = (msg: ChatMessage, clientX: number, clientY: number) => {
    setContextMenu({
      visible: true,
      x: clientX,
      y: clientY,
      messageId: msg.id,
      textItem: msg.text || null,
    });
  };

  const handleMessageTouchStart = (msg: ChatMessage, e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      openContextMenu(msg, touch.clientX, touch.clientY);
    }, 500); 
  };

  const handleMessageTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  const handleCopy = () => {
    if (contextMenu.textItem) {
      navigator.clipboard.writeText(contextMenu.textItem);
    }
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const handleDelete = () => {
    if (contextMenu.messageId) {
      setMessages((prev) => prev.filter((m) => m.id !== contextMenu.messageId));
    }
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className={styles.page}>
      {contextMenu.visible && (
        <div 
          className={styles.contextMenuOverlay} 
          style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 150) }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.textItem && (
            <button className={styles.contextMenuItem} onClick={handleCopy}>
              <Copy size={16} /> Скопировать
            </button>
          )}
          <button className={`${styles.contextMenuItem} ${styles.contextMenuDanger}`} onClick={handleDelete}>
            <Trash2 size={16} /> Удалить
          </button>
        </div>
      )}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>А</div>
          <div>
            <div className={styles.partnerName}>Аноним</div>
            <div className={styles.partnerStatus}>
              {partnerDisconnected ? (
                <span className={styles.offline}>Отключился</span>
              ) : isPartnerRecording ? (
                <span className={styles.typing}>записывает голосовое...</span>
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
            onContextMenu={(e) => {
              e.preventDefault();
              openContextMenu(msg, e.clientX, e.clientY);
            }}
            onTouchStart={(e) => handleMessageTouchStart(msg, e)}
            onTouchEnd={handleMessageTouchEnd}
            onTouchMove={handleMessageTouchEnd}
          >
            {msg.type === 'text' && <p>{msg.text}</p>}
            {msg.type === 'image' && msg.mediaUrl && (
              <img src={msg.mediaUrl} alt="Attached" className={styles.attachedImage} />
            )}
            {msg.type === 'video' && msg.mediaUrl && (
              <video src={msg.mediaUrl} controls playsInline className={styles.attachedImage} />
            )}
            {msg.type === 'voice' && msg.mediaUrl && (
              <VoiceMessagePlayer url={msg.mediaUrl} msgId={msg.id} />
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
        {isRecording ? (
          <div className={styles.recordingOverlay}>
            <div className={styles.recordIndicator} />
            <span className={styles.recordingTime}>
              Запись... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
        ) : (
          <>
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
              accept="image/*,video/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
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
          </>
        )}

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
            onPointerDown={(e) => {
              e.preventDefault();
              startRecording();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              stopRecording();
            }}
            onPointerLeave={stopRecording}
            onPointerCancel={stopRecording}
            onContextMenu={(e) => e.preventDefault()}
            disabled={partnerDisconnected}
            aria-label="Записать голосовое"
            title="Удерживайте для записи"
          >
            <Mic size={18} />
          </button>
        )}
      </footer>
    </div>
  );
}
