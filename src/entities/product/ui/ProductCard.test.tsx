import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { testProduct } from '../model/test-product';
import type { Product } from '../model/types';
import { ProductCard } from './ProductCard';

function renderCard(product: Product) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>,
  );
}

const normalized = (element: HTMLElement) => element.textContent?.replace(/\s/g, ' ');

describe('ProductCard', () => {
  it('ведёт на страницу конфигуратора товара', () => {
    renderCard(testProduct);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/test-light');
  });

  it('показывает название, описание и фото товара по умолчанию', () => {
    renderCard(testProduct);
    expect(screen.getByRole('heading', { name: 'Тестовый светильник' })).toBeInTheDocument();
    expect(screen.getByText('Общее описание товара')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn.test/R-W.jpg');
  });

  it('пишет «от», если цены вариантов различаются', () => {
    renderCard(testProduct);
    expect(normalized(screen.getByRole('link'))).toContain('от 1 000 ₽');
  });

  it('не пишет «от», если у всех вариантов одна цена', () => {
    const product: Product = {
      ...testProduct,
      variants: testProduct.variants.map((variant) => ({ ...variant, price: 4800 })),
    };
    renderCard(product);
    const text = normalized(screen.getByRole('link'));
    expect(text).toContain('4 800 ₽');
    expect(text).not.toContain('от 4 800');
  });
});
