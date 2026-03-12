import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, HelpCircle, Mail } from 'lucide-react';
import styles from './StaticPage.module.css';

export default function HelpPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}><ArrowLeft size={18} /> Главная</Link>
        <div className={styles.logo}><Shield size={20} /> Аноним</div>
      </header>

      <main className={styles.main}>
        <h1>Помощь и поддержка</h1>
        <p className={styles.subtitle}>
          Найдите ответы на популярные вопросы о работе сервиса Аноним.
          Мы заботимся о вашей конфиденциальности.
        </p>

        <section className={styles.section}>
          <h2><HelpCircle size={20} /> Основные вопросы</h2>
          <div className={styles.faq}>
            <details>
              <summary>Как начать чат?</summary>
              <p>Выберите тему, фильтры по полу и возрасту, затем нажмите «Начать чат».</p>
            </details>
            <details>
              <summary>Мои данные хранятся?</summary>
              <p>Нет. Мы не сохраняем историю сообщений и не собираем персональные данные.</p>
            </details>
            <details>
              <summary>Как сменить собеседника?</summary>
              <p>Нажмите кнопку отключения в чате и начните новый поиск.</p>
            </details>
            <details>
              <summary>Как пожаловаться на пользователя?</summary>
              <p>Используйте страницу <Link to="/bug-report">Сообщить об ошибке</Link> для жалоб.</p>
            </details>
          </div>
        </section>

        <section className={styles.section}>
          <h2><Mail size={20} /> Остались вопросы?</h2>
          <p>Наша команда поддержки готова помочь вам 24/7.</p>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Безопасный и анонимный способ общения. Никаких имен, никакой регистрации, только живое общение.</p>
        <p>© 2024 Аноним. Все права защищены.</p>
      </footer>
    </div>
  );
}
