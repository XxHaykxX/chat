import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, MessageCircle, Lock, AlertTriangle, Heart } from 'lucide-react';
import styles from './StaticPage.module.css';

export default function RulesPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}><ArrowLeft size={18} /> Главная</Link>
        <div className={styles.logo}><Shield size={20} /> Аноним</div>
      </header>

      <main className={styles.main}>
        <h1>Правила сервиса Аноним</h1>
        <p className={styles.subtitle}>
          Мы создали это пространство для свободного и безопасного общения.
          Пожалуйста, ознакомьтесь с нашими принципами.
        </p>

        <section className={styles.section}>
          <h2><MessageCircle size={20} /> Правила общения в чате</h2>
          <ul>
            <li>Будьте вежливы и уважайте собеседника</li>
            <li>Не отправляйте спам и рекламу</li>
            <li>Не используйте оскорбления и угрозы</li>
            <li>Не распространяйте незаконный контент</li>
            <li>Не пытайтесь обойти систему фильтрации</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2><Lock size={20} /> Конфиденциальность</h2>
          <p>Ваша анонимность — наш главный приоритет. Мы не храним историю сообщений
          на серверах после завершения диалога и не собираем персональные данные
          для продажи третьим лицам.</p>
        </section>

        <section className={styles.section}>
          <h2><AlertTriangle size={20} /> Нарушения</h2>
          <p>Пользователи, нарушающие правила, могут быть заблокированы без
          предупреждения. Мы оставляем за собой право модерировать сервис
          для обеспечения безопасности всех участников.</p>
        </section>

        <section className={styles.section}>
          <h2><Heart size={20} /> Наша миссия</h2>
          <p>Лучшее место для случайных знакомств и откровенных разговоров.
          Безопасно. Анонимно. Всегда.</p>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 Аноним. Все права защищены.</p>
      </footer>
    </div>
  );
}
