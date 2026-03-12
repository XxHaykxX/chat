import { Loader, X } from 'lucide-react';
import styles from './SearchingPage.module.css';

interface SearchingPageProps {
  onCancel: () => void;
  onlineCount: number;
}

export default function SearchingPage({ onCancel, onlineCount }: SearchingPageProps) {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.spinnerWrap}>
          <Loader size={48} className={styles.spinner} />
        </div>
        <h2 className={styles.title}>Поиск собеседника...</h2>
        <p className={styles.subtitle}>Подключаем вас к чату. Это не займет много времени.</p>
        <div className={styles.onlineCount}>
          <span className={styles.dot} /> {onlineCount} пользователя в сети
        </div>
        <button className={styles.cancelBtn} onClick={onCancel}>
          <X size={18} />
          Отменить поиск
        </button>
      </div>
    </div>
  );
}
