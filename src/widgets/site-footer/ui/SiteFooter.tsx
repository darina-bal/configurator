import { StubLink } from '@/shared/ui/stub-link';

import { FOOTER_ROWS, isFooterSection } from '../config/footer-rows';
import { FooterAccordion } from './FooterAccordion';
import styles from './SiteFooter.module.scss';

/**
 * Подвал сайта — заглушка по образцу centersvet.ru: чёрный фон, разделы-аккордеоны с «плюсом»
 * и строка с копирайтом. Состав — в `config/footer-rows.ts`; все пункты — ссылки-заглушки
 * (`StubLink`), на сайт и в соцсети они не ведут.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.root}>
      <div className={styles.container}>
        <nav aria-label="Ссылки в подвале">
          {FOOTER_ROWS.map((row) => (
            <div key={row.title} className={styles.row}>
              {isFooterSection(row) ? (
                <FooterAccordion section={row} />
              ) : (
                <StubLink className={styles.title}>
                  {row.title}
                  <span className={styles.plus} aria-hidden="true" />
                </StubLink>
              )}
            </div>
          ))}
        </nav>

        <p className={styles.copyright}>
          <span>©</span>{' '}
          <StubLink className={styles.copyrightLink}>
            Центрсвет 2005 - {year}. Все права защищены.
          </StubLink>
        </p>
      </div>
    </footer>
  );
}
