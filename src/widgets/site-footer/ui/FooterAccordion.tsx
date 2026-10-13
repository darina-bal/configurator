import clsx from 'clsx';

import { StubLink } from '@/shared/ui/stub-link';

import { isFooterGroup } from '../config/footer-rows';
import type { FooterGroup, FooterSection } from '../config/footer-rows';
import styles from './SiteFooter.module.scss';

function FooterLinkItem({ label }: Readonly<{ label: string }>) {
  return (
    <li>
      <StubLink className={styles.link}>{label}</StubLink>
    </li>
  );
}

// Вложенный список: выглядит как обычная строка («Партнеры», «Дилеры»), но раскрывается по нажатию.
function FooterGroupItem({ group }: Readonly<{ group: FooterGroup }>) {
  return (
    <li>
      <details>
        <summary className={clsx(styles.link, styles.groupToggle)}>{group.label}</summary>
        <ul className={clsx(styles.list, styles.inner)}>
          {group.links.map((label) => (
            <FooterLinkItem key={label} label={label} />
          ))}
        </ul>
      </details>
    </li>
  );
}

/**
 * Раздел подвала: строка-заголовок с «плюсом», по нажатию раскрывается список пунктов-заглушек.
 * Нативный <details>: клавиатура и состояние «раскрыто» работают без своего кода.
 */
export function FooterAccordion({ section }: Readonly<{ section: FooterSection }>) {
  return (
    <details>
      <summary className={styles.title}>
        {section.title}
        <span className={styles.plus} aria-hidden="true" />
      </summary>
      <ul className={styles.list}>
        {section.items.map((item) =>
          isFooterGroup(item) ? (
            <FooterGroupItem key={item.label} group={item} />
          ) : (
            <FooterLinkItem key={item} label={item} />
          ),
        )}
        {section.note && <li className={styles.note}>{section.note}</li>}
      </ul>
    </details>
  );
}
