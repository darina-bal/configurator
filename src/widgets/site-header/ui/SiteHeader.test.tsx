import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { SiteHeader } from './SiteHeader';

function renderHeader() {
  return render(
    <MemoryRouter>
      <SiteHeader />
    </MemoryRouter>,
  );
}

const menuButton = () => screen.getByRole('button', { name: 'Меню' });

describe('SiteHeader', () => {
  it('содержит логотип-ссылку на каталог', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'Центрсвет — на главную' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('единственная настоящая ссылка шапки — логотип: на сайт ничего не ведёт', () => {
    const { container } = renderHeader();

    const links = container.querySelectorAll('a[href]');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/');
    expect(container.querySelector('[target]')).toBeNull();
  });

  it.each(['Продукты', 'Контакты', 'Компания', 'Поиск'])(
    'пункт меню «%s» есть в меню, но это заглушка без адреса',
    (label) => {
      renderHeader();

      const menu = screen.getByRole('navigation', { name: 'Основное меню' });
      const stub = within(menu).getByText(label).closest('a');
      expect(stub).not.toBeNull();
      expect(stub).not.toHaveAttribute('href');
    },
  );

  it.each(['Международная версия сайта', 'Кабинет дизайнера'])(
    'значок «%s» подписан для скринридера и является заглушкой без адреса',
    (label) => {
      renderHeader();

      const stub = screen.getByText(label).closest('a');
      expect(stub).not.toBeNull();
      expect(stub).not.toHaveAttribute('href');
    },
  );

  it('показывает счётчик корзины', () => {
    renderHeader();
    expect(screen.getByRole('status')).toHaveTextContent('Корзина, товаров:');
  });

  it('это шапка страницы (banner) без телефона и слогана — их нет в шапке сайта', () => {
    renderHeader();

    const header = screen.getByRole('banner');
    expect(header).not.toHaveTextContent('+7');
    expect(header).not.toHaveTextContent('премиум');
  });

  describe('меню на узких экранах', () => {
    it('кнопка «Меню» раскрывает и сворачивает меню', async () => {
      renderHeader();
      expect(menuButton()).toHaveAttribute('aria-expanded', 'false');

      await userEvent.click(menuButton());
      expect(menuButton()).toHaveAttribute('aria-expanded', 'true');

      await userEvent.click(menuButton());
      expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    });

    it('кнопка управляет панелью меню', () => {
      renderHeader();

      const menu = screen.getByRole('navigation', { name: 'Основное меню' });
      expect(menuButton()).toHaveAttribute('aria-controls', menu.id);
    });

    it('Escape закрывает меню и возвращает фокус на кнопку', async () => {
      renderHeader();
      await userEvent.click(menuButton());
      await userEvent.tab(); // фокус уходит на логотип — внутрь шапки
      expect(menuButton()).not.toHaveFocus();

      await userEvent.keyboard('{Escape}');

      expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
      expect(menuButton()).toHaveFocus();
    });

    it('нажатие на пункт-заглушку закрывает меню: фокус уходит с кнопки, а идти некуда', async () => {
      renderHeader();
      await userEvent.click(menuButton());

      await userEvent.click(
        within(screen.getByRole('navigation', { name: 'Основное меню' })).getByText('Компания'),
      );

      expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    });

    it('переход на главную по логотипу закрывает меню', async () => {
      renderHeader();
      await userEvent.click(menuButton());

      await userEvent.click(screen.getByRole('link', { name: 'Центрсвет — на главную' }));

      expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    });

    it('остаётся открытым, пока фокус внутри шапки, и закрывается, когда фокус уходит', async () => {
      renderHeader();
      await userEvent.click(menuButton());

      await userEvent.tab(); // логотип — последний элемент шапки, что получает фокус
      expect(screen.getByRole('link', { name: 'Центрсвет — на главную' })).toHaveFocus();
      expect(menuButton()).toHaveAttribute('aria-expanded', 'true');

      await userEvent.tab(); // заглушки фокус не получают — дальше фокус уходит со страницы

      expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
