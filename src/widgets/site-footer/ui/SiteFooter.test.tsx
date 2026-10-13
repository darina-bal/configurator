import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { SiteFooter } from './SiteFooter';

/** Раскрывает раздел: нажимает на его строку-заголовок. */
async function openSection(title: string) {
  const summary = screen.getByText(title, { selector: 'summary' });
  await userEvent.click(summary);
  return summary;
}

describe('SiteFooter', () => {
  it('это подвал страницы (contentinfo) с пунктами в отдельной навигации', () => {
    render(<SiteFooter />);

    const footer = screen.getByRole('contentinfo');
    expect(
      within(footer).getByRole('navigation', { name: 'Ссылки в подвале' }),
    ).toBeInTheDocument();
  });

  it.each([
    'Наши консультанты',
    'Наши шоурумы',
    'Наши соцсети',
    'О компании',
    'Контакты',
    'Карьера',
  ])('показывает раздел «%s» свёрнутым', (title) => {
    render(<SiteFooter />);

    const section = screen.getByText(title, { selector: 'summary' }).closest('details');
    expect(section).not.toBeNull();
    expect(section).not.toHaveAttribute('open');
  });

  it('«Кабинет дизайнера» — сразу строка-заглушка, а не раскрывающийся раздел', () => {
    render(<SiteFooter />);

    const row = screen.getByText('Кабинет дизайнера');
    expect(row.tagName).toBe('A');
    expect(row).not.toHaveAttribute('href');
    expect(row.closest('details')).toBeNull();
  });

  it('прячет пункты раздела, пока он свёрнут, и показывает после нажатия на заголовок', async () => {
    render(<SiteFooter />);
    const telegram = screen.getByText('Telegram');
    expect(telegram).not.toBeVisible();

    const summary = await openSection('Наши соцсети');

    expect(summary.closest('details')).toHaveAttribute('open');
    expect(telegram).toBeVisible();
  });

  it('сворачивает раздел повторным нажатием', async () => {
    render(<SiteFooter />);
    const summary = await openSection('Наши шоурумы');
    expect(summary.closest('details')).toHaveAttribute('open');

    await userEvent.click(summary);

    expect(summary.closest('details')).not.toHaveAttribute('open');
  });

  it('разделы раскрываются независимо друг от друга', async () => {
    render(<SiteFooter />);

    const first = await openSection('Наши шоурумы');
    const second = await openSection('Карьера');

    expect(first.closest('details')).toHaveAttribute('open');
    expect(second.closest('details')).toHaveAttribute('open');
  });

  it.each([
    ['Наши консультанты', 'Интернет-магазин'],
    ['Наши шоурумы', 'Москва'],
    ['Наши соцсети', 'Telegram'],
    ['О компании', 'О нас'],
    ['Контакты', 'Доставка'],
    ['Карьера', 'Наши вакансии'],
  ])('в разделе «%s» после раскрытия виден пункт «%s»', async (title, label) => {
    render(<SiteFooter />);
    await openSection(title);

    const section = screen.getByText(title, { selector: 'summary' }).closest('details');
    if (!section) throw new Error(`Нет раздела ${title}`);

    expect(within(section).getByText(label)).toBeVisible();
  });

  it.each([
    ['О компании', 'Партнеры', 'Дизайнеры и Архитекторы'],
    ['Контакты', 'Дилеры', 'Хабаровск'],
  ])('в разделе «%s» вложенный список «%s» раскрывается отдельно', async (title, group, label) => {
    render(<SiteFooter />);
    await openSection(title);
    const nested = screen.getByText(label);
    expect(nested).not.toBeVisible();

    await userEvent.click(screen.getByText(group, { selector: 'summary' }));

    expect(nested).toBeVisible();
  });

  it('показывает примечание о Meta под списком соцсетей', async () => {
    render(<SiteFooter />);
    await openSection('Наши соцсети');

    expect(screen.getByText(/Компания Meta признана экстремистской организацией/)).toBeVisible();
  });

  it('копирайт с текущим годом — тоже заглушка, а не ссылка на политику конфиденциальности', () => {
    render(<SiteFooter />);

    const copyright = screen.getByText(/Центрсвет 2005 - /);
    expect(copyright).toHaveTextContent(
      `Центрсвет 2005 - ${new Date().getFullYear()}. Все права защищены.`,
    );
    expect(copyright.tagName).toBe('A');
    expect(copyright).not.toHaveAttribute('href');
  });

  it('в подвале много ссылок-заглушек, но ни одной настоящей: ни на сайт, ни в соцсети', () => {
    const { container } = render(<SiteFooter />);

    expect(container.querySelectorAll('a').length).toBeGreaterThan(40);
    expect(container.querySelectorAll('a[href]')).toHaveLength(0);
    expect(container.querySelectorAll('[target]')).toHaveLength(0);
    expect(screen.queryAllByRole('link', { hidden: true })).toHaveLength(0);
  });
});
