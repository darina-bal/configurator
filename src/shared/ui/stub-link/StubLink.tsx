import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

import styles from './StubLink.module.scss';

/**
 * Ссылка-заглушка: стоит на месте ссылки на реальный сайт и выглядит как она, но никуда не
 * ведёт. `<a>` без `href` — «ссылка-заместитель» по стандарту HTML: не получает фокус, не
 * переходит и не открывает вкладок. Адрес передать нельзя — его нет в типе атрибутов.
 */
export function StubLink({
  children,
  className,
  ...rest
}: Readonly<HTMLAttributes<HTMLAnchorElement>>) {
  return (
    <a {...rest} className={clsx(styles.stub, className)}>
      {children}
    </a>
  );
}
