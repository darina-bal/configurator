import type { IconName } from '@/shared/ui/icon';

interface MenuItem {
  label: string;
  /** Значок после названия: у «Поиска» — лупа. */
  icon?: IconName;
}

/**
 * Главное меню centersvet.ru. На сайте «Продукты», «Контакты» и «Компания» раскрывают большие
 * подменю; в прототипе шапка — заглушка, поэтому пункты — ссылки-заглушки без адреса.
 */
export const MENU_ITEMS: readonly MenuItem[] = [
  { label: 'Продукты' },
  { label: 'Контакты' },
  { label: 'Компания' },
  { label: 'Поиск', icon: 'search' },
];

/** Значки справа от меню (между ними — корзина): подписи для скринридера, значки без текста. */
export const INTERNATIONAL_LABEL = 'Международная версия сайта';
export const ACCOUNT_LABEL = 'Кабинет дизайнера';
