import { Outlet, ScrollRestoration } from 'react-router';

import { SiteFooter } from '@/widgets/site-footer';
import { SiteHeader } from '@/widgets/site-header';

import styles from './Layout.module.scss';

/** Общий каркас страниц: липкая шапка, содержимое маршрута и подвал, прижатый к низу окна. */
export function Layout() {
  return (
    <div className={styles.root}>
      <SiteHeader />
      <div className={styles.content}>
        <Outlet />
      </div>
      <SiteFooter />
      <ScrollRestoration />
    </div>
  );
}
