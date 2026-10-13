import clsx from 'clsx';
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';

import { CartIndicator } from '@/entities/cart';
import { ROUTES } from '@/shared/config';
import { Icon } from '@/shared/ui/icon';
import { StubLink } from '@/shared/ui/stub-link';

import { ACCOUNT_LABEL, INTERNATIONAL_LABEL, MENU_ITEMS } from '../config/menu';
import styles from './SiteHeader.module.scss';
import { SiteLogo } from './SiteLogo';

/**
 * Шапка сайта — заглушка по образцу centersvet.ru: логотип (ведёт на главную прототипа),
 * меню по центру, справа значки международной версии, корзины со счётчиком и кабинета.
 * На экранах уже 1024px меню прячется за кнопку (на весь экран), остаются логотип и корзина.
 * Пункты меню и значки — ссылки-заглушки (`StubLink`): на сайт они не ведут. Живое здесь только
 * логотип и счётчик корзины.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  // Пока меню открыто: Escape закрывает его и возвращает фокус на кнопку; уход фокуса за пределы
  // шапки тоже закрывает — иначе фокус попал бы в содержимое страницы под белой панелью меню.
  // Фокус уходит и при Tab с логотипа (последнего элемента шапки, что получает фокус), и при
  // нажатии на пункт-заглушку: она не фокусируется, так что меню закрывается, как закрылось бы
  // после перехода по настоящей ссылке.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      burgerRef.current?.focus();
    }

    function handleFocusOut(event: FocusEvent) {
      const next = event.relatedTarget;
      if (!(next instanceof Node) || !rootRef.current?.contains(next)) setOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [open]);

  return (
    <header ref={rootRef} className={clsx(styles.root, open && styles.open)}>
      <div className={styles.bar}>
        <button
          ref={burgerRef}
          type="button"
          className={styles.burger}
          aria-label="Меню"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen(!open)}
        >
          {open ? <Icon name="close" size={14} /> : <Icon name="burger" size={20} />}
        </button>

        <Link
          to={ROUTES.catalog}
          className={styles.logo}
          aria-label="Центрсвет — на главную"
          onClick={() => setOpen(false)}
        >
          <SiteLogo className={styles.logoImage} />
        </Link>

        <nav id={menuId} className={styles.nav} aria-label="Основное меню">
          <ul className={styles.menu}>
            {MENU_ITEMS.map((item) => (
              <li key={item.label}>
                <StubLink className={styles.link}>
                  {item.label}
                  {item.icon && <Icon name={item.icon} className={styles.linkIcon} />}
                </StubLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <StubLink className={clsx(styles.action, styles.service, styles.international)}>
            <Icon name="globe" size={14} />
            <span className={styles.hidden}>{INTERNATIONAL_LABEL}</span>
          </StubLink>
          <div className={clsx(styles.action, styles.cart)}>
            <CartIndicator />
          </div>
          <StubLink className={clsx(styles.action, styles.service)}>
            <Icon name="user" size={13} />
            <span className={styles.hidden}>{ACCOUNT_LABEL}</span>
          </StubLink>
        </div>
      </div>
    </header>
  );
}
