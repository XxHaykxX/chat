import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Sun, Moon, Shield } from 'lucide-react';
import type { Filters, Theme } from '../types';
import styles from './FilterPage.module.css';

interface FilterPageProps {
  onStartSearch: (filters: Filters) => void;
  onlineCount: number;
  theme: Theme;
  onToggleTheme: () => void;
}

const TOPICS = [
  { value: 'general' as const, label: 'Общение' },
  { value: 'flirt' as const, label: 'Флирт 18+' },
  { value: 'roleplay' as const, label: 'Ролка' },
];

const GENDERS = [
  { value: 'unknown' as const, label: 'Некто' },
  { value: 'male' as const, label: 'М' },
  { value: 'female' as const, label: 'Ж' },
];

const PARTNER_GENDERS = [
  { value: 'any' as const, label: 'Не важно' },
  { value: 'male' as const, label: 'М' },
  { value: 'female' as const, label: 'Ж' },
];

const AGES = [
  { value: 'under17' as const, label: 'до 17 лет' },
  { value: '18-21' as const, label: 'от 18 до 21 года' },
  { value: '22-25' as const, label: 'от 22 до 25 лет' },
  { value: '26-35' as const, label: 'от 26 до 35 лет' },
  { value: '36plus' as const, label: 'старше 36 лет' },
];

export default function FilterPage({ onStartSearch, onlineCount, theme, onToggleTheme }: FilterPageProps) {
  const [filters, setFilters] = useState<Filters>({
    topic: 'general',
    myGender: 'unknown',
    partnerGender: 'any',
    myAge: 'any',
    partnerAge: 'any',
  });

  const handleSubmit = () => {
    onStartSearch(filters);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Shield size={24} />
          <span>Аноним</span>
        </div>
        <nav className={styles.nav}>
          <Link to="/rules">Правила</Link>
          <Link to="/help">Помощь</Link>
          <button
            onClick={onToggleTheme}
            className={styles.themeBtn}
            aria-label={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>Привет! 👋</h1>
          <p>Найди собеседника по интересам. Анонимно и без регистрации.</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Настройки чата</h2>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Тема общения:</h3>
            <div className={styles.btnGroup}>
              {TOPICS.map((t) => (
                <button
                  key={t.value}
                  className={`${styles.optionBtn} ${filters.topic === t.value ? styles.active : ''}`}
                  onClick={() => setFilters((f) => ({ ...f, topic: t.value }))}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          <div className={styles.row}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Ваш пол:</h3>
              <div className={styles.btnGroup}>
                {GENDERS.map((g) => (
                  <button
                    key={g.value}
                    className={`${styles.optionBtn} ${filters.myGender === g.value ? styles.active : ''}`}
                    onClick={() => setFilters((f) => ({ ...f, myGender: g.value }))}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Пол собеседника:</h3>
              <div className={styles.btnGroup}>
                {PARTNER_GENDERS.map((g) => (
                  <button
                    key={g.value}
                    className={`${styles.optionBtn} ${filters.partnerGender === g.value ? styles.active : ''}`}
                    onClick={() => setFilters((f) => ({ ...f, partnerGender: g.value }))}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className={styles.row}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Ваш возраст:</h3>
              <div className={styles.ageGroup}>
                {AGES.map((a) => (
                  <button
                    key={a.value}
                    className={`${styles.optionBtn} ${styles.ageBtn} ${filters.myAge === a.value ? styles.active : ''}`}
                    onClick={() => setFilters((f) => ({ ...f, myAge: a.value }))}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Возраст собеседника:</h3>
              <div className={styles.ageGroup}>
                {AGES.map((a) => (
                  <button
                    key={a.value}
                    className={`${styles.optionBtn} ${styles.ageBtn} ${filters.partnerAge === a.value ? styles.active : ''}`}
                    onClick={() => setFilters((f) => ({ ...f, partnerAge: a.value }))}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <button className={styles.startBtn} onClick={handleSubmit}>
            <MessageCircle size={20} />
            Начать чат
          </button>
        </div>

        <div className={styles.onlineCount}>
          Находятся в чате: <strong>{onlineCount}</strong> пользователя
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 Аноним. Все права защищены.</p>
      </footer>
    </div>
  );
}
