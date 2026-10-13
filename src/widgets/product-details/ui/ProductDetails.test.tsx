import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getProductBySlug } from '@/entities/product';

import { ProductDetails } from './ProductDetails';

const loopRt = getProductBySlug('loop_rt_main');
const locusDuo = getProductBySlug('locus_duo');
const loopWhite = loopRt?.variants[0];
const recessedWhite = locusDuo?.variants[0];
const surfaceWhite = locusDuo?.variants[3];
if (!loopRt || !locusDuo || !loopWhite || !recessedWhite || !surfaceWhite) {
  throw new Error('Нет данных каталога');
}

describe('ProductDetails: блоки описания', () => {
  it('показывает оригинальное описание LOOP.RT одной плашкой с заголовком', () => {
    render(<ProductDetails product={loopRt} variant={loopWhite} />);

    const description = screen.getByRole('region', { name: 'Описание' });
    expect(within(description).getByRole('heading', { name: 'LOOP.RT' })).toBeInTheDocument();
    expect(description).toHaveTextContent('Встроенный потолочный светильник мощностью 12 Вт');
    expect(description).toHaveTextContent('Глубина встройки 70 мм');
  });

  it('у LOCUS DUO показывает те же три плашки, что стоят на странице сайта', () => {
    render(<ProductDetails product={locusDuo} variant={recessedWhite} />);

    const titles = within(screen.getByRole('region', { name: 'Описание' }))
      .getAllByRole('heading')
      .map((heading) => heading.textContent);
    expect(titles).toEqual(['SUPERSLIM (DALI)', 'ТРЕКИ', 'SSD.LOCUS']);
  });

  it('описание зависит от трека', () => {
    const { rerender } = render(<ProductDetails product={locusDuo} variant={recessedWhite} />);
    const description = () => screen.getByRole('region', { name: 'Описание' });
    expect(description()).toHaveTextContent('для встроенного трека');

    rerender(<ProductDetails product={locusDuo} variant={surfaceWhite} />);
    expect(description()).toHaveTextContent('для накладного трека');
    expect(within(description()).getByRole('heading', { name: 'ТРЕК' })).toBeInTheDocument();
  });
});

describe('ProductDetails: таблица характеристик', () => {
  it('показывает строки в порядке и с названиями таблицы на сайте', () => {
    render(<ProductDetails product={loopRt} variant={loopWhite} />);

    const specs = screen.getByRole('region', { name: 'Характеристики' });
    const terms = within(specs)
      .getAllByRole('term')
      .map((term) => term.textContent);
    expect(terms).toEqual([
      'Название',
      'Артикул',
      'Отделка',
      'Мощность',
      'Управление',
      'Температура',
      'Цветопередача',
      'Качество света',
      'Пульсация',
      'Подключение',
      'Угол света',
      'Влагозащита',
      'Гарантия',
    ]);
  });

  it('значения — в формате сайта', () => {
    render(<ProductDetails product={loopRt} variant={loopWhite} />);

    const specs = screen.getByRole('region', { name: 'Характеристики' });
    for (const value of [
      'LOOP.RT80.12W.30K.80A.APW.DALI',
      'PAINT WHITE',
      '12W',
      '3000K',
      '220V',
      'IP44',
      'Medium',
      '2 года',
    ]) {
      expect(specs).toHaveTextContent(value);
    }
  });

  it('меняется вместе с SKU', () => {
    const { rerender } = render(<ProductDetails product={locusDuo} variant={recessedWhite} />);
    const specs = () => screen.getByRole('region', { name: 'Характеристики' });
    expect(specs()).toHaveTextContent('4W');
    expect(specs()).toHaveTextContent('2700K');
    expect(specs()).toHaveTextContent('Medium');

    rerender(<ProductDetails product={locusDuo} variant={surfaceWhite} />);
    expect(specs()).toHaveTextContent('8W');
    expect(specs()).toHaveTextContent('3000K');
    expect(specs()).toHaveTextContent('Spot');
    expect(specs()).toHaveTextContent('5 лет');
  });
});

describe('ProductDetails: раскладка под плашками описания', () => {
  it.each([
    ['LOOP.RT', loopRt, loopWhite],
    ['LOCUS DUO, встроенный трек', locusDuo, recessedWhite],
    ['LOCUS DUO, накладной трек', locusDuo, surfaceWhite],
  ])('%s: фото и чертёж не повторяются — они есть только в галерее', (_name, product, variant) => {
    const { container } = render(<ProductDetails product={product} variant={variant} />);

    expect(container.querySelectorAll('img, picture, figure, video, iframe')).toHaveLength(0);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(screen.queryByRole('region', { name: 'Изображения' })).not.toBeInTheDocument();
  });

  it.each([
    ['LOOP.RT', loopRt, loopWhite],
    ['LOCUS DUO', locusDuo, recessedWhite],
  ])(
    '%s: рядом с таблицей характеристик стоит блок скачивания с паспортом',
    (_name, product, variant) => {
      render(<ProductDetails product={product} variant={variant} />);

      const specs = screen.getByRole('region', { name: 'Характеристики' });
      const files = screen.getByRole('region', { name: 'Файлы для скачивания' });

      // Две колонки одной строки: на десктопе таблица слева, блок скачивания справа, на узких
      // экранах он идёт сразу под таблицей.
      expect(files.parentElement).toBe(specs.parentElement);
      expect(specs.compareDocumentPosition(files)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(files).toHaveTextContent('Паспорт, инструкция');
    },
  );
});

describe('ProductDetails: блок скачивания', () => {
  it('показывает три строки сайта: 3D Files и DIALux приглушены, паспорт — заглушка', () => {
    render(<ProductDetails product={loopRt} variant={loopWhite} />);

    const files = screen.getByRole('region', { name: 'Файлы для скачивания' });
    expect(within(files).getAllByRole('listitem')).toHaveLength(3);
    expect(files).toHaveTextContent('3D Files');
    expect(files).toHaveTextContent('DIALux');
    expect(files).toHaveTextContent('Паспорт, инструкция');
    expect(within(files).getAllByText('файла нет')).toHaveLength(2);
  });

  it('паспорт и инструкция (PDF) — ссылка-заглушка: на сайт она не ведёт', () => {
    render(<ProductDetails product={loopRt} variant={loopWhite} />);

    const files = screen.getByRole('region', { name: 'Файлы для скачивания' });
    const passport = within(files).getByText('Паспорт, инструкция').closest('a');
    expect(passport).not.toBeNull();
    expect(passport).not.toHaveAttribute('href');
    expect(passport).not.toHaveAttribute('target');
    expect(passport).toHaveTextContent('.pdf');
    expect(within(files).queryAllByRole('link')).toHaveLength(0);
  });

  it('не показывает блок, если файлов нет', () => {
    render(<ProductDetails product={loopRt} variant={{ ...loopWhite, files: [] }} />);

    expect(screen.queryByRole('region', { name: 'Файлы для скачивания' })).not.toBeInTheDocument();
  });
});
