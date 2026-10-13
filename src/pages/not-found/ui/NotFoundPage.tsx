import { Link } from 'react-router';

import { ROUTES } from '@/shared/config';
import { useDocumentTitle } from '@/shared/lib/use-document-title';

import styles from './NotFoundPage.module.scss';

export function NotFoundPage() {
  useDocumentTitle('Страница не найдена — Центрсвет');

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Страница не найдена</h1>
      <p className={styles.text}>Такого адреса или товара нет в каталоге.</p>
      <Link to={ROUTES.catalog} className={styles.link}>
        Вернуться к каталогу
      </Link>
    </main>
  );
}
