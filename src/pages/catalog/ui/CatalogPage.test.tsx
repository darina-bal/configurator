import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { CatalogPage } from './CatalogPage';

function renderCatalog() {
  return render(
    <MemoryRouter>
      <CatalogPage />
    </MemoryRouter>,
  );
}

const normalized = (element: HTMLElement) => element.textContent?.replace(/\s/g, ' ');

describe('CatalogPage', () => {
  it('показывает заголовок и обе карточки товаров со ссылками на конфигураторы', () => {
    renderCatalog();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Конфигуратор светильников' }),
    ).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/product/loop_rt_main',
      '/product/locus_duo',
    ]);
    expect(screen.getByRole('heading', { name: 'LOOP.RT' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'LOCUS DUO' })).toBeInTheDocument();
  });

  it('показывает цену «от» только там, где цены вариантов различаются', () => {
    renderCatalog();

    const [loopRt, locusDuo] = screen.getAllByRole('link');
    expect(normalized(loopRt as HTMLElement)).toContain('4 800 ₽');
    expect(normalized(loopRt as HTMLElement)).not.toContain('от 4 800');
    expect(normalized(locusDuo as HTMLElement)).toContain('от 10 800 ₽');
  });

  it('устанавливает заголовок вкладки', () => {
    renderCatalog();
    expect(document.title).toBe('Конфигуратор светильников — Центрсвет');
  });
});
