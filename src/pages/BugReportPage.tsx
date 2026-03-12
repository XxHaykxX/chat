import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Bug, Send } from 'lucide-react';
import styles from './StaticPage.module.css';

export default function BugReportPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}><ArrowLeft size={18} /> Главная</Link>
        <div className={styles.logo}><Shield size={20} /> Аноним</div>
      </header>

      <main className={styles.main}>
        <h1><Bug size={24} /> Сообщить об ошибке</h1>
        <p className={styles.subtitle}>
          Помогите нам стать лучше. Опишите проблему, с которой вы столкнулись,
          и мы постараемся её исправить.
        </p>

        {submitted ? (
          <div className={styles.successMsg}>
            Спасибо! Ваше сообщение отправлено. Мы рассмотрим его в ближайшее время.
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="category">Категория проблемы</label>
              <select id="category" className={styles.select}>
                <option>Ошибка интерфейса</option>
                <option>Проблема с подключением</option>
                <option>Жалоба на пользователя</option>
                <option>Другое</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="description">Описание</label>
              <textarea
                id="description"
                className={styles.textarea}
                rows={5}
                placeholder="Опишите проблему подробно..."
                required
              />
            </div>
            <button type="submit" className={styles.submitBtn}>
              <Send size={16} /> Отправить
            </button>
          </form>
        )}
      </main>

      <footer className={styles.footer}>
        <p>© 2024 Аноним. Все права защищены.</p>
      </footer>
    </div>
  );
}
